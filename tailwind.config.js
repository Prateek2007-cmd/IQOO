/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          900: "#04090E",
          850: "#071019",
          800: "#091720",
          700: "#0B1A24",
          600: "#0E222E",
          500: "#102A37",
        },
        line: {
          subtle: "rgba(145,205,235,0.10)",
          soft: "rgba(145,205,235,0.18)",
          strong: "rgba(145,205,235,0.28)",
        },
        cyanx: "#00D9FF",
        bluex: "#247BFF",
        violetx: "#8D6CFF",
        magentax: "#C47BFF",
        amberx: "#FF9A57",
        greenx: "#23D7A0",
        warnx: "#FFB547",
        dangerx: "#FF4D5E",
        txt: {
          primary: "#F4F8FA",
          secondary: "#91AAB8",
          muted: "#526D7C",
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
