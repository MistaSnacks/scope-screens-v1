"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./curtain-credits-hero.module.css";
import { getVelvetDataUrl } from "@/lib/velvet";
import { useTheme } from "./theme-provider";
import { PRIMARY_CREDITS, SECONDARY_CREDITS } from "@/lib/hero-nav";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// Billowing velvet — vertex shader gives the whole drape a slow in/out sway
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

  // Pin the OUTER margin (u -> 1) flat against the screen edge so the billow
  // never recedes there and exposes the screen behind the curtain. The sway is
  // free in the interior and at the inner seam; it just tapers to 0 at the edge.
  float uEnv = smoothstep(1.0, 0.7, u);

  // Low-frequency sway of the whole folded sheet (a soft draft, not a ripple).
  float fold1 = sin(u * 3.0 - uTime * 1.0);
  float fold2 = sin(u * 5.5 - uTime * 1.6);
  float billow = fold1 * 0.6 + fold2 * 0.4;

  float ripple = billow * 0.06 * vEnv * uEnv;
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

  float seamShadow = smoothstep(0.0, 0.16, u);
  base.rgb *= mix(0.32, 1.0, seamShadow);

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

// The 2025 sizzle reel "SS × AMC 2" (landscape, 0:55) from the Wix media library —
// plays muted/looped on the cinema screen the curtains reveal. 1080p is only ~23MB
// here. Poster is a real frame of the reel (Lex reacting with the popcorn box) so
// SSR/first-paint and reduced-motion show an on-brand still.
const SIZZLE_REEL_MP4 =
  "https://video.wixstatic.com/video/c51492_990803f9c25b4ea491c4180a6eb9a435/1080p/mp4/file.mp4";
const SIZZLE_REEL_POSTER =
  "https://static.wixstatic.com/media/c51492_990803f9c25b4ea491c4180a6eb9a435f003.jpg";
const POPCORN_LOGO = "/popcorn-logo.png";

export function CurtainCreditsHero() {
  const root = useRef<HTMLElement>(null);
  const spotRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const leftPlaneEl = useRef<HTMLDivElement>(null);
  const rightPlaneEl = useRef<HTMLDivElement>(null);
  const logoOpeningRef = useRef<HTMLDivElement>(null);
  const reelVideoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef({ value: 0 });
  const openFactorRef = useRef(0.86); // how far the velvet parts; overwritten in useGSAP (0.86 desktop / 0.92 mobile)
  const curtainsRef = useRef<CurtainsLike | null>(null);

  const { theme } = useTheme();
  const [velvetSrc, setVelvetSrc] = useState("");
  const [curtainsReady, setCurtainsReady] = useState(false);
  const [reelMuted, setReelMuted] = useState(true);
  const screenVisibility = curtainsReady ? "visible" : "hidden";

  // The reel autoplays muted (browsers require it). The toggle flips audio and
  // re-plays so the unmute counts as a user gesture.
  const toggleReelSound = useCallback(() => {
    const v = reelVideoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setReelMuted(v.muted);
    void v.play().catch(() => {});
  }, []);

  // The original procedural velvet remains the single visual source for the
  // valance, first-paint panels, and animated WebGL curtains.
  useEffect(() => {
    setVelvetSrc(getVelvetDataUrl());
  }, [theme]);

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
  // settle slightly open — framing the screen. SAME scroll mechanism as before;
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
          // Framing open: curtains rest as side drapes that frame a large
          // screen (closer to the reference) while keeping visible billow.
          openFactorRef.current = mobile ? 0.84 : 0.76;

          // Reduced motion: skip the scroll choreography, show the framed hero
          // with the logo opening already cleared away.
          if (reduced) {
            progressRef.current.value = 1;
            gsap.set(spotRef.current, { opacity: 1 });
            gsap.set(logoOpeningRef.current, { opacity: 0 });
            return;
          }

          // Logo opening starts visible on the closed curtain.
          gsap.set(logoOpeningRef.current, { opacity: 1, y: 0 });

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
            })
            .to(progressRef.current, { value: 1, ease: "none", duration: 1 }, 0)
            // The logo opening (with its scroll cue) lifts + fades over the first
            // third of the open, before the curtains are fully parted.
            .to(
              logoOpeningRef.current,
              { opacity: 0, y: -48, duration: 0.4, ease: "power2.in" },
              0
            )
            .to({}, { duration: 0.6 });
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
  // measurements and a stale curtains canvas — the curtains end up misaligned or
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
      {/* Preload the first-paint curtain image so it's hot before layout. */}
      <link rel="preload" as="image" href="/curtain-closed.jpg" fetchPriority="high" />

      {/* The revealed stage (z-10): framed silver screen + credits beneath.
          Behind the curtains (z-20); hidden until the curtains have painted. */}
      <div className={styles.screen} style={{ visibility: screenVisibility }}>
        <div className={styles.topMarquee} aria-hidden>
          — A LexScope Production · Scope Screenings —
        </div>

        {/* Framed silver screen — the sizzle reel plays here, muted by default. */}
        <div className={styles.silverFrame}>
          <video
            ref={reelVideoRef}
            className={styles.frameVideo}
            autoPlay
            muted
            loop
            playsInline
            poster={SIZZLE_REEL_POSTER}
            aria-hidden
          >
            <source src={SIZZLE_REEL_MP4} type="video/mp4" />
          </video>

          <div className={styles.projectorGlow} aria-hidden />

          {/* Legibility scrim under the headline. */}
          <div className={styles.frameScrim} aria-hidden />

          {/* The headline, on the screen — the marquee title over the reel. */}
          <div className={styles.screenTitle}>
            <span className={styles.screenEyebrow}>Feature Presentation</span>
            <h1 className={styles.screenWordmark}>
              Scope
              <br />
              Screenings
            </h1>
            <span className={styles.screenTagline}>
              Seattle&rsquo;s Underground Film Festival
            </span>
          </div>

          <div className={styles.recTick} aria-hidden>
            <span className={styles.recDot} />
            REC
          </div>
          <div className={styles.reelCounter} aria-hidden>
            REEL 01 / 01
          </div>

          <button
            type="button"
            onClick={toggleReelSound}
            aria-label={reelMuted ? "Turn the reel sound on" : "Mute the reel"}
            className={styles.soundToggle}
          >
            <span className={styles.soundIcon} aria-hidden />
            {reelMuted ? "Sound On" : "Mute"}
          </button>
        </div>

        <div className={styles.subLabel} aria-hidden>
          <span />
          Now Showing
          <span />
        </div>

        {/* Nav as credits — two primary actions + one secondary line. */}
        <div className={styles.creditsUnder}>
          <div className={styles.creditsPrimary}>
            {PRIMARY_CREDITS.map((c, i) => (
              <a
                key={c.label}
                href={c.href}
                className={`${styles.creditPrimary} ${i === 0 ? styles.creditSpot : ""}`}
              >
                <span className={styles.creditRole}>{c.role}</span>
                <span className={styles.creditLabel}>{c.label}</span>
              </a>
            ))}
          </div>
          {SECONDARY_CREDITS.map((c) => (
            <a key={c.label} href={c.href} className={styles.creditSecondary}>
              {c.label}
            </a>
          ))}
        </div>
      </div>

      {/* Follow spotlight across the revealed stage. */}
      <div
        ref={spotRef}
        aria-hidden
        className={styles.spot}
        style={{ visibility: screenVisibility }}
      />

      {/* Logo opening (z-30) — glows centered on the closed curtain, with its
          scroll cue directly beneath; lifts away on scroll. */}
      <div ref={logoOpeningRef} className={styles.logoOpening}>
        <div className={styles.logoTonight}>— Tonight —</div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={POPCORN_LOGO} alt="Scope Screenings" className={styles.logoImg} />
        <div aria-hidden className={styles.scrollCue}>
          Scroll to enter
          <span className={styles.scrollCueLine} />
        </div>
      </div>

      {/* First-paint curtain stand-in (SSR), swapped for the live canvas. */}
      <div aria-hidden className={styles.curtainStandIn} />

      {/* WebGL velvet curtain planes. The <img> is the texture sampler only. */}
      <div ref={leftPlaneEl} aria-hidden className={`${styles.plane} ${styles.planeL}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={velvetSrc} alt="" data-sampler="velvetTexture" style={{ display: "none" }} />
      </div>
      <div ref={rightPlaneEl} aria-hidden className={`${styles.plane} ${styles.planeR}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={velvetSrc} alt="" data-sampler="velvetTexture" style={{ display: "none" }} />
      </div>
      <div ref={canvasContainerRef} aria-hidden className={styles.glCanvas} />

      <div aria-hidden className={styles.letterboxBottom} />
    </section>
  );
}
