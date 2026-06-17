"use client";

import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./curtain-credits-hero.module.css";
import { getVelvetDataUrl } from "@/lib/velvet";
import { useTheme } from "./theme-provider";

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

interface Credit {
  role: string;
  label: string;
  href: string;
  spot?: boolean;
}

// The 2025 sizzle reel "SS × AMC 2" (landscape, 0:55) from the Wix media library —
// plays muted/looped on the cinema screen the curtains reveal. 1080p is only ~23MB
// here. Poster is a real frame of the reel (Lex reacting with the popcorn box) so
// SSR/first-paint and reduced-motion show an on-brand still.
const SIZZLE_REEL_MP4 =
  "https://video.wixstatic.com/video/c51492_990803f9c25b4ea491c4180a6eb9a435/1080p/mp4/file.mp4";
const SIZZLE_REEL_POSTER =
  "https://static.wixstatic.com/media/c51492_990803f9c25b4ea491c4180a6eb9a435f003.jpg";

// The navigation, rendered as an end-credits roll. Each line is a destination.
const CREDITS: Credit[] = [
  { role: "General · VIP · Season Pass", label: "Buy Tickets", href: "#tickets", spot: true },
  { role: "Open Call · FilmFreeway", label: "Submit a Film", href: "#submit" },
  { role: "200+ Shorts · 150+ Filmmakers", label: "The Films", href: "#films" },
  { role: "Sponsor · Donate · Shunpike", label: "Become a Funder", href: "#support" },
  { role: "Press Kit · Coverage · Contact", label: "Press & Media", href: "#support" },
  { role: "Founded by Lex Scope · Est. 2022", label: "About the Festival", href: "#about" },
];

export function CurtainCreditsHero({ eyebrow = "Feature Presentation", tagline = "Seattle's Underground Film Festival" }: { eyebrow?: string; tagline?: string } = {}) {
  const root = useRef<HTMLElement>(null);
  const spotRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const leftPlaneEl = useRef<HTMLDivElement>(null);
  const rightPlaneEl = useRef<HTMLDivElement>(null);
  const progressRef = useRef({ value: 0 });
  const openFactorRef = useRef(0.62); // how far the velvet parts (framed, not off)
  const curtainsRef = useRef<CurtainsLike | null>(null);

  const { theme } = useTheme();
  const [velvetSrc, setVelvetSrc] = useState("");
  const [curtainsReady, setCurtainsReady] = useState(false);
  const screenVisibility = curtainsReady ? "visible" : "hidden";

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
          openFactorRef.current = mobile ? 0.76 : 0.62;

          // Reduced motion: skip the scroll choreography, show the framed hero.
          if (reduced) {
            progressRef.current.value = 1;
            gsap.set(spotRef.current, { opacity: 1 });
            return;
          }

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
      {/* Preload the first-paint curtain image so it's hot before the standIn
          lays out (hoisted to <head> by React; only on routes with the hero). */}
      <link rel="preload" as="image" href="/curtain-closed.jpg" fetchPriority="high" />

      {/* The sizzle reel on the screen (z-1) — curtains part to reveal it. */}
      <video
        className={styles.heroVideo}
        style={{ visibility: screenVisibility }}
        autoPlay
        muted
        loop
        playsInline
        poster={SIZZLE_REEL_POSTER}
        aria-hidden
      >
        <source src={SIZZLE_REEL_MP4} type="video/mp4" />
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
        <div className={styles.title}>
          <span className={styles.eyebrow}>{eyebrow}</span>
          <h1 className={styles.wordmark}>
            Scope
            <br />
            Screenings
          </h1>
          <span className={styles.tagline}>{tagline}</span>
        </div>

        <div className={styles.creditsMask}>
          <div className={styles.track}>
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
      </div>

      {/* Follow spotlight */}
      <div
        ref={spotRef}
        aria-hidden
        className={styles.spot}
        style={{ visibility: screenVisibility }}
      />

      {/* First-paint curtain: a screenshot of the real shaded WebGL curtain
          (/curtain-closed.jpg — see .shots/capture-curtain.mjs), so it is in the
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
          src={velvetSrc}
          alt=""
          data-sampler="velvetTexture"
          style={{ display: "none" }}
        />
      </div>
      <div ref={rightPlaneEl} aria-hidden className={`${styles.plane} ${styles.planeR}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={velvetSrc}
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
