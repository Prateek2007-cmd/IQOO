/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        space: "#020407",
        bg: "#0A0F1C",
        surface: "#0F1B2D",
        panel: "#1E2A3F",
        ink: {
          900: "#020407",
          850: "#0A0F1C",
          800: "#0F1B2D",
          700: "#14243B",
          600: "#1A2E4C",
          500: "#1E2A3F",
        },
        line: {
          subtle: "rgba(51,65,85,0.45)",
          soft: "rgba(51,65,85,0.70)",
          strong: "rgba(0,209,255,0.40)",
        },
        cyanx: "#00D1FF",
        bluex: "#3882F6",
        purplex: "#885CF6",
        violetx: "#885CF6",
        magentax: "#885CF6",
        amberx: "#F59E0B",
        greenx: "#10B981",
        warnx: "#F59E0B",
        dangerx: "#EF4444",
        border: "#334155",
        txt: {
          primary: "#E2E8F0",
          secondary: "#94A3B8",
          muted: "#64748B",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        display: ["Space Grotesk", "Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xs: "10px",
        sm: "12px",
        md: "16px",
        lg: "20px",
        xl: "24px",
        "2xl": "28px",
        "3xl": "34px",
      },
      boxShadow: {
        panel: "0 18px 50px -24px rgba(0,0,0,0.85), inset 0 1px 0 rgba(190,225,245,0.05)",
        elevated:
          "0 26px 70px -30px rgba(0,0,0,0.95), inset 0 1px 0 rgba(190,225,245,0.07)",
        core: "0 0 90px -10px rgba(0,217,255,0.35)",
        focus: "0 0 0 1px rgba(0,217,255,0.55), 0 0 24px -4px rgba(0,217,255,0.45)",
      },
      letterSpacing: {
        wordmark: "0.34em",
        label: "0.16em",
      },
      transitionTimingFunction: {
        premium: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      keyframes: {
        breathe: {
          "0%, 100%": { opacity: "0.55", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.03)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "0.35" },
          "50%": { opacity: "0.9" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        floatY: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        sweep: {
          "0%": { transform: "translateX(-120%)" },
          "100%": { transform: "translateX(220%)" },
        },
      },
      animation: {
        breathe: "breathe 4.5s ease-in-out infinite",
        "pulse-soft": "pulseSoft 3s ease-in-out infinite",
        shimmer: "shimmer 3.5s linear infinite",
        "float-y": "floatY 6s ease-in-out infinite",
        sweep: "sweep 4.2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
