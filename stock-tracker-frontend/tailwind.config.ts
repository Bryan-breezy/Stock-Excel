import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#171B1A",
        paper: "#E9E4D6",
        card: "#F5F1E6",
        rail: "#D3CBB6",
        sub: "#6B6656",
        tape: {
          DEFAULT: "#E85D2C",
          dark: "#C94E22",
        },
        ok: { DEFAULT: "#2F6B4F", bg: "#DEE8DC" },
        warn: { DEFAULT: "#C98A25", bg: "#F1E3C6" },
        danger: { DEFAULT: "#B33F35", bg: "#F0DAD6" },
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
        mono: ["var(--font-mono)"],
      },
    },
  },
  plugins: [],
};

export default config;
