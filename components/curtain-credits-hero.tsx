"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./curtain-credits-hero.module.css";
import { getVelvetDataUrl } from "@/lib/velvet";
import { useTheme } from "./theme-provider";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// Billowing velvet - vertex shader gives the whole drape a slow in/out sway
// (low-frequency folds over u + time), the rails pinned so it breathes rather
// than flaps. Ported from the other Scope Screenings build; the exit-calm was
// removed so the framed velvet keeps billowing at rest.
const vertexShader = `
precision mediump float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform float uProgress;
uniform float uTime;
uniform float uSide;
varying vec3 vVertexPosition;
varying vec2 vTextureCoord;
varying float vRipple;

void main() {
  vec3 pos = aVertexPosition;
  float u = uSide < 0.0 ? (1.0 - aTextureCoord.x) : aTextureCoord.x;
  float v = aTextureCoord.y;

  // Pin top & bottom edges so the billow swells in/out, never fans up.
  float vEnv = smoothstep(0.0, 0.2, v) * smoothstep(1.0, 0.8, v);

  // Pin BOTH the inner seam (u -> 0, the visible parting/lit edge) AND the outer
  // margin (u -> 1, against the frame) so the billow only breathes in the BODY
  // of the drape. Previously only the outer edge was pinned and the inner seam
  // swung free: that swept the visible leading edge through z, and perspective
  // peeled it into an unnatural convex bulge right at the lit fold (and let the
  // closed seam bow past its partner). Pinning the seam - as the proven
  // persistent-curtains build does - keeps the lit edge flat and lets only the
  // interior swell in and out, which reads as fabric rather than a dome.
  float uEnv = smoothstep(0.0, 0.18, u) * smoothstep(1.0, 0.7, u);

  // Low-frequency sway of the whole folded sheet (a soft draft, not a ripple).
  float fold1 = sin(u * 3.0 - uTime * 1.0);
  float fold2 = sin(u * 5.5 - uTime * 1.6);
  float billow = fold1 * 0.6 + fold2 * 0.4;

  float ripple = billow * 0.045 * vEnv * uEnv; // gentle depth, matching the reference drape
  pos.z += ripple;

  vTextureCoord = aTextureCoord;
  vVertexPosition = pos;
  vRipple = ripple;

  gl_Position = uPMatrix * uMVMatrix * vec4(pos, 1.0);
}
`;

const fragmentShader = `
precision mediump float;
varying vec3 vVertexPosition;
varying vec2 vTextureCoord;
varying float vRipple;
uniform sampler2D velvetTexture;
uniform float uSide;
uniform float uProgress;

void main() {
  vec2 uv = vTextureCoord;
  float u = uSide < 0.0 ? (1.0 - uv.x) : uv.x;

  vec4 base = texture2D(velvetTexture, uv);

  float fold = sin(u * 38.0) * 0.5 + 0.5;
  fold = pow(fold, 2.4);
  base.rgb *= mix(0.5, 1.1, fold);

  float rippleLight = clamp(1.0 + vRipple * 1.9, 0.35, 1.6);
  base.rgb *= rippleLight;

  // Inner-edge shading - a lit vertical gather at the leading edge: a bright
  // crest catching the stage spot with a shadow valley tucked just behind it,
  // so the edge reads as a rounded velvet fold against the dark screen. Closed,
  // the center is a soft overlap shadow (the two drapes meeting); as they PART
  // it rolls into the lit fold. That reveal ramps with uProgress (as in the
  // first iteration) but caps at EDGE_MAX, so the fully-open look settles at the
  // dialed-back reference brightness instead of the old too-hot full crest.
  float EDGE_MAX = 0.7;                              // open-edge brightness (1.0 was too hot)
  float edgeReveal = EDGE_MAX * smoothstep(0.05, 0.35, uProgress);

  float seamShadow = smoothstep(0.0, 0.16, u);     // soft drape-overlap base shadow
  float closedShade = mix(0.32, 1.0, seamShadow);

  float lip = smoothstep(0.014, 0.0, u);           // thin shadow terminator at the very edge
  float crest = smoothstep(0.05, 0.014, u) * smoothstep(0.0, 0.014, u); // lit roll just inboard of the lip
  float valley = smoothstep(0.0, 0.07, u) * smoothstep(0.22, 0.09, u);
  float openShade = mix(1.0, 0.34, valley) * mix(1.0, 0.55, lip);       // valley + edge shadow

  base.rgb *= mix(closedShade, openShade, edgeReveal);
  base.rgb += vec3(0.30, 0.10, 0.045) * crest * edgeReveal; // warm crest catch, dialed to the reference

  base.rgb *= mix(0.7, 1.0, smoothstep(0.0, 0.18, uv.y));
  base.rgb *= mix(0.88, 1.0, smoothstep(0.95, 0.6, uv.y));

  gl_FragColor = vec4(base.rgb, 1.0);
}
`;

interface PlaneLike {
  uniforms: {
    progress: { value: number };
    time: { value: number };
    side: { value: number };
  };
  onRender: (cb: () => void) => PlaneLike;
  setRelativeTranslation: (translation: unknown) => void;
}

interface CurtainsLike {
  dispose: () => void;
  resize: () => void;
}

interface Credit {
  role: string;
  label: string;
  href: string;
  spot?: boolean;
}

// The 2025 sizzle reel "SS × AMC 2" (landscape, 0:55) from the Wix media library -
// plays muted/looped on the cinema screen the curtains reveal. 1080p is only ~23MB
// here. Poster is a real frame of the reel (Lex reacting with the popcorn box) so
// SSR/first-paint and reduced-motion show an on-brand still.
const SIZZLE_REEL_MP4 =
  "https://video.wixstatic.com/video/c51492_990803f9c25b4ea491c4180a6eb9a435/1080p/mp4/file.mp4";
const SIZZLE_REEL_POSTER =
  "https://static.wixstatic.com/media/c51492_990803f9c25b4ea491c4180a6eb9a435f003.jpg";
const POPCORN_LOGO = "/popcorn-logo.png";

// The navigation, rendered as an end-credits roll. Each line is a destination.
const CREDITS: Credit[] = [
  { role: "General · VIP · Season Pass", label: "Buy Tickets", href: "#tickets", spot: true },
  { role: "Open Call · FilmFreeway", label: "Submit a Film", href: "#submit" },
  { role: "200+ Shorts · 150+ Filmmakers", label: "The Films", href: "#films" },
  { role: "Sponsor · Donate · Shunpike", label: "Become a Funder", href: "#support" },
  { role: "Press Kit · Coverage · Contact", label: "Press & Media", href: "#support" },
  { role: "Founded by Lex Scope · Est. 2022", label: "About the Festival", href: "#about" },
];

export function CurtainCreditsHero({ eyebrow = "Feature Presentation", tagline = "Seattle's Underground Film Festival", title = "Scope\nScreenings", posterUrl, videoUrl }: { eyebrow?: string; tagline?: string; title?: string; posterUrl?: string; videoUrl?: string } = {}) {
  const root = useRef<HTMLElement>(null);
  const spotRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const leftPlaneEl = useRef<HTMLDivElement>(null);
  const rightPlaneEl = useRef<HTMLDivElement>(null);
  const logoOpeningRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const creditsRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reelControlsRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef({ value: 0 });
  const openFactorRef = useRef(0.62); // how far the velvet parts (framed, not off)
  const curtainsRef = useRef<CurtainsLike | null>(null);
  // When the visitor hits "Hide text", the title + credits drop out so the reel
  // plays clean. The scroll timeline's onUpdate also writes their opacity every
  // tick, so it reads this ref and skips those writes while text is hidden -
  // otherwise the next scroll tick would fade them right back in.
  const textHiddenRef = useRef(false);

  const { theme } = useTheme();
  // Reel audio (autoplays muted - browsers require it) and the "watch clean"
  // text toggle. Both are driven by the corner buttons on the revealed screen.
  const [reelMuted, setReelMuted] = useState(true);
  const [textHidden, setTextHidden] = useState(false);
  const [velvetSrc, setVelvetSrc] = useState("");
  const [curtainsReady, setCurtainsReady] = useState(false);
  const screenVisibility = curtainsReady ? "visible" : "hidden";

  // The original procedural velvet remains the single visual source for the
  // valance, first-paint panels, and animated WebGL curtains.
  useEffect(() => {
    setVelvetSrc(getVelvetDataUrl());
  }, [theme]);

  // "Sound" toggle. The reel autoplays muted; flipping audio from a user
  // gesture (the button) is allowed. Re-play in case the tab throttled it.
  const toggleSound = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setReelMuted(v.muted);
    void v.play().catch(() => {});
  }, []);

  const toggleText = useCallback(() => setTextHidden((t) => !t), []);

  // "Hide text" toggle. Fade the title + credits out (and back), and flip the
  // ref the scroll timeline checks so it stops re-driving their opacity (the
  // corner controls are a separate element, so they stay put).
  useEffect(() => {
    textHiddenRef.current = textHidden;
    const targets = [titleRef.current, creditsRef.current].filter(Boolean);
    if (!targets.length) return;
    gsap.to(targets, {
      opacity: textHidden ? 0 : 1,
      y: 0,
      pointerEvents: textHidden ? "none" : "auto",
      duration: 0.4,
      ease: "power2.out",
      overwrite: true,
    });
  }, [textHidden]);

  // WebGL velvet: two curtains.js planes textured with the procedural velvet.
  // They render into the z-22 canvas and slide apart in document space as the
  // scroll-driven progress goes 0 → 1.
  useEffect(() => {
    if (!velvetSrc) return;
    let cancelled = false;
    let revealFrame: number | null = null;

    (async () => {
      try {
        const mod = await import("curtainsjs");
        if (
          cancelled ||
          !canvasContainerRef.current ||
          !leftPlaneEl.current ||
          !rightPlaneEl.current
        ) {
          return;
        }

        const { Curtains, Plane, Vec3 } = mod as unknown as {
          Curtains: new (opts: object) => CurtainsLike;
          Plane: new (renderer: CurtainsLike, el: HTMLElement, params: object) => PlaneLike;
          Vec3: new (x: number, y: number, z: number) => unknown;
        };

        const curtains = new Curtains({
          container: canvasContainerRef.current,
          pixelRatio: Math.min(1.5, window.devicePixelRatio),
          antialias: true,
          alpha: true,
          // Reveal the screen if WebGL is unavailable instead of leaving the
          // entire hero permanently blank.
          onError: () => {
            if (!cancelled) setCurtainsReady(true);
          },
          // Hero is pinned by ScrollTrigger, so disable curtains' own scroll watch;
          // the open is driven entirely by progress.
          watchScroll: false,
        });
        curtainsRef.current = curtains;

        const commonParams = {
          widthSegments: 24,
          heightSegments: 24,
          vertexShader,
          fragmentShader,
        };

        const leftPlane = new Plane(curtains, leftPlaneEl.current, {
          ...commonParams,
          uniforms: {
            progress: { name: "uProgress", type: "1f", value: 0 },
            time: { name: "uTime", type: "1f", value: 0 },
            side: { name: "uSide", type: "1f", value: -1 },
          },
        });

        const rightPlane = new Plane(curtains, rightPlaneEl.current, {
          ...commonParams,
          uniforms: {
            progress: { name: "uProgress", type: "1f", value: 0 },
            time: { name: "uTime", type: "1f", value: 0 },
            side: { name: "uSide", type: "1f", value: 1 },
          },
        });

        const tick = (plane: PlaneLike, side: number, el: HTMLDivElement | null) => {
          const p = progressRef.current.value;
          plane.uniforms.progress.value = p;
          plane.uniforms.time.value += 0.016;
          // Slide the plane off its own side to the framed resting position. y
          // locked to 0 so it parts dead-flat horizontally. `|| ` (not `??`) so a
          // 0-width measurement during a racy mount falls back too, instead of
          // collapsing the translation and misaligning the halves.
          const width = el?.offsetWidth || window.innerWidth / 2;
          plane.setRelativeTranslation(
            new Vec3(side * p * width * openFactorRef.current, 0, 0)
          );
        };
        leftPlane.onRender(() => tick(leftPlane, -1, leftPlaneEl.current));
        let firstFrame = true;
        rightPlane.onRender(() => {
          tick(rightPlane, 1, rightPlaneEl.current);
          if (firstFrame) {
            firstFrame = false;
            // onRender runs immediately before Curtains.js draws. Reveal on the
            // next browser frame so the real curtain pixels have been composited.
            revealFrame = window.requestAnimationFrame(() => {
              if (!cancelled) setCurtainsReady(true);
            });
          }
        });

        // Re-measure after the planes exist alongside the pinned hero so the two
        // halves seat exactly against center on refresh and restored scroll.
        curtains.resize();
        ScrollTrigger.refresh();
      } catch {
        if (!cancelled) setCurtainsReady(true);
      }
    })();

    return () => {
      cancelled = true;
      if (revealFrame !== null) window.cancelAnimationFrame(revealFrame);
      curtainsRef.current?.dispose();
      curtainsRef.current = null;
    };
  }, [velvetSrc]);

  // The curtains part as you SCROLL through the hero (pinned + scrubbed), then
  // settle slightly open - framing the screen. SAME scroll mechanism as before;
  // it now drives the WebGL `progress` instead of CSS panel transforms.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        {
          desktop: "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
          mobile: "(max-width: 767px) and (prefers-reduced-motion: no-preference)",
          reduced: "(prefers-reduced-motion: reduce)",
        },
        (ctx) => {
          const { mobile, reduced } = ctx.conditions as {
            desktop: boolean;
            mobile: boolean;
            reduced: boolean;
          };
          openFactorRef.current = mobile ? 0.76 : 0.62;

          // Reduced motion: skip the scroll choreography, show the framed hero
          // with the logo opening already cleared away.
          if (reduced) {
            progressRef.current.value = 1;
            gsap.set(spotRef.current, { opacity: 1 });
            gsap.set(logoOpeningRef.current, { opacity: 0 });
            gsap.set(titleRef.current, { opacity: 1, y: 0 });
            gsap.set(creditsRef.current, { opacity: 1, y: 0, pointerEvents: "auto" });
            gsap.set(reelControlsRef.current, { opacity: 1, pointerEvents: "auto" });
            videoRef.current?.play().catch(() => {});
            return;
          }

          // Logo opening starts visible on the closed curtain.
          gsap.set(logoOpeningRef.current, { opacity: 1, y: 0 });

          // Title + CTAs fade in as a monotonic LATCH driven by the curtain
          // progress below - once in, they never fade back out, so the user can
          // keep playing with the (reversible) curtains + logo while the hero
          // stays assembled and clickable. Resets only on a real remount
          // (refresh / hard refresh). The title's fade is keyed to begin as the
          // popcorn logo lifts away, then resolves slowly as the curtains finish
          // opening - a deliberate, picture-esque handoff, not a quick pop.
          gsap.set(titleRef.current, { opacity: 0, y: 16 });
          gsap.set(creditsRef.current, { opacity: 0, y: 12, pointerEvents: "none" });
          // Corner reel controls hide behind the closed curtain until it parts.
          gsap.set(reelControlsRef.current, { opacity: 0, pointerEvents: "none" });

          const titleEase = gsap.parseEase("sine.inOut");
          const ctaEase = gsap.parseEase("power2.out");
          let revealMax = 0; // highest curtain progress seen - never decreases
          let videoStarted = false;

          // Progress starts at 0 (closed); scroll scrubs it to 1 (framed), then
          // the pinned hero holds before it scrolls away.
          gsap
            .timeline({
              scrollTrigger: {
                trigger: root.current,
                start: "top top",
                end: mobile ? "+=140%" : "+=190%",
                pin: true,
                scrub: 0.6,
                anticipatePin: 1,
                invalidateOnRefresh: true,
              },
              // Drives the latching hero reveal + the one-shot video start. Runs
              // every tick (incl. the scrub settle) so the fade tracks the
              // curtains smoothly and full-open is caught even after scroll stops.
              onUpdate: () => {
                const p = progressRef.current.value;
                revealMax = Math.max(revealMax, p);

                // The title's fade begins as the popcorn logo finishes lifting
                // away (~0.25) and resolves slowly across the rest of the open
                // (~0.9) - a slow, filmic handoff. The CTAs follow a beat later.
                // Eased + latched (driven by revealMax, not p), so a scrub back
                // toward closed never fades them out again.
                const titleO = titleEase(Math.min(1, Math.max(0, (revealMax - 0.25) / 0.65)));
                const ctaO = ctaEase(Math.min(1, Math.max(0, (revealMax - 0.45) / 0.5)));

                // While "Hide text" is on, leave the title + credits where the
                // toggle's tween parked them (faded out) instead of re-driving
                // their reveal here.
                if (!textHiddenRef.current) {
                  gsap.set(titleRef.current, { opacity: titleO, y: 16 * (1 - titleO) });
                  gsap.set(creditsRef.current, {
                    opacity: ctaO,
                    y: 12 * (1 - ctaO),
                    // Clickable once revealed, and stays clickable thereafter.
                    pointerEvents: ctaO > 0.95 ? "auto" : "none",
                  });
                }

                // The corner reel controls ride in with the CTAs (and stay,
                // independent of the text toggle, so you can always re-show it).
                gsap.set(reelControlsRef.current, {
                  opacity: ctaO,
                  pointerEvents: ctaO > 0.95 ? "auto" : "none",
                });

                // Roll the sizzle reel the instant the curtains hit full open.
                // Once started it keeps playing even if the curtains scrub shut.
                const v = videoRef.current;
                if (v && !videoStarted && p >= 0.999) {
                  videoStarted = true;
                  v.play().catch(() => {});
                }
              },
            })
            .to(progressRef.current, { value: 1, ease: "none", duration: 1 }, 0)
            // The popcorn logo + its "Scroll to enter" cue lifts + fades over the
            // first third of the open, before the curtains are fully parted.
            .to(
              logoOpeningRef.current,
              { opacity: 0, y: -48, duration: 0.4, ease: "power2.in" },
              0
            )
            // Hold the fully framed hero a beat before it scrolls away (the
            // curtains + logo remain fully reversible playthings).
            .to({}, { duration: 0.6 }, 1);
        }
      );
    },
    { scope: root }
  );

  // Spotlight follows the cursor across the revealed screen.
  useEffect(() => {
    const el = spotRef.current;
    const host = root.current;
    if (!el || !host) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const r0 = host.getBoundingClientRect();
    gsap.set(el, { x: r0.width / 2, y: r0.height * 0.46 });

    const xTo = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3" });
    const onMove = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      xTo(e.clientX - r.left);
      yTo(e.clientY - r.top);
    };
    host.addEventListener("pointermove", onMove);
    return () => host.removeEventListener("pointermove", onMove);
  }, []);

  // Browser back/forward (bfcache) restores this page with frozen GSAP pin
  // measurements and a stale curtains canvas - the curtains end up misaligned or
  // stuck open. On a restore, re-measure the curtains and the pinned
  // ScrollTrigger so scroll once again drives the open 0 → 1 from a clean state.
  useEffect(() => {
    const onPageShow = (e: PageTransitionEvent) => {
      if (!e.persisted) return; // a fresh load already mounts clean
      curtainsRef.current?.resize();
      ScrollTrigger.refresh();
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  return (
    <section
      ref={root}
      className={`${styles.hero} ${curtainsReady ? "" : styles.awaitingCurtains}`}
      aria-label="Scope Screenings"
    >
      {/* Preload the first-paint curtain image so it's hot before the standIn
          lays out (hoisted to <head> by React; only on routes with the hero). */}
      <link rel="preload" as="image" href="/curtain-closed.jpg" fetchPriority="high" />

      {/* The sizzle reel on the screen (z-1) - curtains part to reveal it. It
          holds on its poster frame and only starts playing once the curtains
          reach full open (see the timeline's onUpdate), so the reveal lands on
          the first frame rather than mid-shot. */}
      <video
        ref={videoRef}
        className={styles.heroVideo}
        style={{ visibility: screenVisibility }}
        muted
        loop
        playsInline
        preload="auto"
        poster={posterUrl ?? SIZZLE_REEL_POSTER}
        aria-hidden
      >
        <source src={videoUrl ?? SIZZLE_REEL_MP4} type="video/mp4" />
      </video>
      <div
        className={styles.heroScrim}
        style={{ visibility: screenVisibility }}
        aria-hidden
      />

      {/* Deep oxblood edge guards (z-5): below the curtains, above the screen
          video. If the billow ever pulls the velvet inward at the far margins,
          these read as the dark proscenium fold instead of exposing the screen. */}
      <div
        className={styles.edgeGuardL}
        style={{ visibility: screenVisibility }}
        aria-hidden
      />
      <div
        className={styles.edgeGuardR}
        style={{ visibility: screenVisibility }}
        aria-hidden
      />

      {/* The screen the curtains reveal */}
      <div className={styles.screen} style={{ visibility: screenVisibility }}>
        <div ref={titleRef} className={styles.title}>
          <span className={styles.eyebrow}>{eyebrow}</span>
          <h1 className={styles.wordmark}>
            {title.split("\n").map((line, i) => (
              <span key={i}>{i > 0 && <br />}{line}</span>
            ))}
          </h1>
          <span className={styles.tagline}>{tagline}</span>
        </div>

        <div className={styles.creditsMask}>
          <div ref={creditsRef} className={styles.track}>
            <span className={styles.rule} aria-hidden />
            {CREDITS.map((c) => {
              const external = c.href.startsWith("http");
              return (
                <a
                  key={c.label}
                  href={c.href}
                  {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className={`${styles.credit} ${c.spot ? styles.creditSpot : ""}`}
                >
                  <span className={styles.creditRole}>{c.role}</span>
                  <span className={styles.creditLabel}>{c.label}</span>
                </a>
              );
            })}
          </div>
        </div>

        {/* Corner reel controls - they live on the revealed screen (so they sit
            inside the parted curtains, not over the velvet) and fade in with the
            CTAs. "Hide text" (left) drops the title + credits so the reel plays
            clean; "Sound" (right) unmutes it. */}
        <div ref={reelControlsRef} className={styles.reelControls}>
          <button
            type="button"
            onClick={toggleText}
            aria-pressed={textHidden}
            aria-label={textHidden ? "Show the hero text" : "Hide the hero text to watch the reel"}
            className={`${styles.reelBtn} ${styles.reelBtnLeft}`}
          >
            <EyeIcon off={textHidden} />
            {textHidden ? "Show Text" : "Hide Text"}
          </button>
          <button
            type="button"
            onClick={toggleSound}
            aria-pressed={!reelMuted}
            aria-label={reelMuted ? "Turn the reel sound on" : "Mute the reel"}
            className={`${styles.reelBtn} ${styles.reelBtnRight}`}
          >
            <span className={styles.reelPlayIcon} aria-hidden />
            {reelMuted ? "Sound On" : "Mute"}
          </button>
        </div>
      </div>

      {/* Follow spotlight */}
      <div
        ref={spotRef}
        aria-hidden
        className={styles.spot}
        style={{ visibility: screenVisibility }}
      />

      {/* Popcorn logo (z-30) - glows centered on the closed curtain, with its
          "Scroll to enter" cue directly beneath; lifts + fades away on scroll. */}
      <div ref={logoOpeningRef} className={styles.logoOpening}>
        <div className={styles.logoTonight}>- Lexscope Presents -</div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={POPCORN_LOGO} alt="Scope Screenings" className={styles.logoImg} />
        <div aria-hidden className={styles.scrollCue}>
          Scroll to enter
          <span className={styles.scrollCueLine} />
        </div>
      </div>

      {/* First-paint curtain: a screenshot of the real shaded WebGL curtain
          (/curtain-closed.jpg - see .shots/capture-curtain.mjs), so it is in the
          SSR markup and covers the screen on frame one, then swaps atomically to
          the live canvas with no visible change. */}
      <div aria-hidden className={styles.curtainStandIn} />

      {/* WebGL velvet curtain planes. The <img> is the texture sampler only
          (display:none); curtains.js renders the billowing velvet into the
          z-22 canvas and slides the planes apart. The source divs stay put and
          must never capture pointer input. */}
      <div ref={leftPlaneEl} aria-hidden className={`${styles.plane} ${styles.planeL}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={velvetSrc || undefined}
          alt=""
          data-sampler="velvetTexture"
          style={{ display: "none" }}
        />
      </div>
      <div ref={rightPlaneEl} aria-hidden className={`${styles.plane} ${styles.planeR}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={velvetSrc || undefined}
          alt=""
          data-sampler="velvetTexture"
          style={{ display: "none" }}
        />
      </div>
      <div ref={canvasContainerRef} aria-hidden className={styles.glCanvas} />

      <div aria-hidden className={styles.letterboxBottom} />
    </section>
  );
}

// Eye / eye-off glyph for the "Hide text" control, sized to sit beside the
// reel button's mono label like the play triangle does on its partner.
function EyeIcon({ off }: { off: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {off ? (
        <>
          <path d="M9.9 4.24A9.1 9.1 0 0 1 12 4c6.5 0 10 7 10 7a13.2 13.2 0 0 1-2.16 3.19m-3.36 2.32A9.5 9.5 0 0 1 12 18c-6.5 0-10-7-10-7a13.2 13.2 0 0 1 4-4.51" />
          <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
          <path d="m2 2 20 20" />
        </>
      ) : (
        <>
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
          <circle cx="12" cy="12" r="3" />
        </>
      )}
    </svg>
  );
}
