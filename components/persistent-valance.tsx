"use client";

import { useEffect, useState } from "react";
import { generateVelvetDataUrl } from "@/lib/velvet";
import { useTheme } from "./theme-provider";

/**
 * The velvet valance pelmet across the top of the hero — deep oxblood velvet
 * header with a scalloped hem and a faint brass top line. Sits BELOW the nav
 * and above the curtains. Decorative chrome only (pointer-events-none).
 * Lights up in House Lights: lit velvet + softer (non-inky) shading.
 */
export function PersistentValance() {
  const { theme } = useTheme();
  const house = theme === "house";
  const [velvetSrc, setVelvetSrc] = useState<string>("");

  useEffect(() => {
    setVelvetSrc(generateVelvetDataUrl(theme));
  }, [theme]);

  const topShade = house ? "rgba(74,14,12,0.26)" : "rgba(0,0,0,0.55)";
  const botShade = house ? "rgba(74,14,12,0.3)" : "rgba(0,0,0,0.5)";
  const fallback = house ? "#b22a20" : "#5a0f0f";
  const boxShadow = house
    ? "inset 0 -8px 20px rgba(120,30,24,0.38), inset 0 4px 0 rgba(224,177,90,0.25)"
    : "inset 0 -8px 24px rgba(0,0,0,0.6), inset 0 4px 0 rgba(224,177,90,0.15)";
  const scallopTop = house ? "rgba(74,14,12,0.22)" : "rgba(0,0,0,0.4)";
  const scallopBot = house ? "rgba(74,14,12,0.5)" : "rgba(0,0,0,0.7)";

  return (
    <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-50">
      <div
        className="flex h-[56px] w-full items-end justify-center"
        style={{
          backgroundImage: velvetSrc
            ? `linear-gradient(180deg, ${topShade} 0%, rgba(0,0,0,0) 35%, ${botShade} 100%), url(${velvetSrc})`
            : `linear-gradient(180deg, ${fallback} 0%, #7a1414 40%, #4a0c0c 100%)`,
          backgroundSize: velvetSrc ? "100% 100%, 256px 256px" : undefined,
          backgroundRepeat: velvetSrc ? "no-repeat, repeat" : undefined,
          backgroundColor: fallback,
          boxShadow,
        }}
      >
        <div className="flex h-[16px] w-full">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="flex-1"
              style={{
                backgroundImage: velvetSrc
                  ? `linear-gradient(180deg, ${scallopTop} 0%, rgba(0,0,0,0.15) 50%, ${scallopBot} 100%), url(${velvetSrc})`
                  : "linear-gradient(180deg, transparent 0%, #6a1212 50%, #4a0c0c 100%)",
                backgroundSize: velvetSrc ? "100% 100%, 256px 256px" : undefined,
                backgroundRepeat: velvetSrc ? "no-repeat, repeat" : undefined,
                backgroundColor: fallback,
                borderRadius: "0 0 50% 50%",
                boxShadow: house
                  ? "inset 0 -4px 8px rgba(120,30,24,0.4)"
                  : "inset 0 -4px 8px rgba(0,0,0,0.5)",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
