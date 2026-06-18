import { Cinzel, Libre_Franklin, Anton, Fraunces, JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";

// Aachen Bold - the Pulp Fiction title face. Display headings.
export const aachen = localFont({
  src: "./fonts/aachen-bold.otf",
  weight: "700",
  style: "normal",
  variable: "--font-aachen",
  display: "swap",
});

// Cinzel - Roman inscriptional caps, the end-credits roll.
export const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  display: "swap",
});

// Libre Franklin - workhorse sans for body / UI / labels.
export const libreFranklin = Libre_Franklin({
  subsets: ["latin"],
  variable: "--font-libre",
  display: "swap",
});

// Anton - heavy condensed for the marquee + big stats.
export const anton = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-anton",
  display: "swap",
});

// Fraunces - editorial serif (sub-font) for the end-credits roll + body/quotes.
export const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["opsz", "SOFT"],
});

// JetBrains Mono - sub-font for labels, eyebrows, UI, and ticket/credits meta.
export const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});
