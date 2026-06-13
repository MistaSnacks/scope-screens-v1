export function GrainOverlay() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[100] opacity-[0.07] mix-blend-overlay"
      style={{
        backgroundImage:
          "radial-gradient(rgba(247,243,230,0.5) 1px, transparent 1px), radial-gradient(rgba(255,187,0,0.3) 1px, transparent 1px)",
        backgroundSize: "3px 3px, 5px 5px",
        backgroundPosition: "0 0, 1px 2px",
        animation: "grain-shift 8s steps(10) infinite",
      }}
    />
  );
}
