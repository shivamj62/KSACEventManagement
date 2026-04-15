/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0a0b", // Deep Onyx
        primary: {
          DEFAULT: "#17d15a", // CMYK Green
          hover: "#14b34d",
          muted: "rgba(23, 209, 90, 0.1)",
        },
        secondary: {
          DEFAULT: "#1a1a2e", // Deep Navy
          light: "#16213e",
        },
        accent: "#0f3460",
        surface: "#121214",
        border: "rgba(255, 255, 255, 0.08)",
        text: {
          primary: "#f8f9fa",
          secondary: "#a0aec0",
          muted: "#718096",
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif', 'system-ui'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      backgroundImage: {
        'gradient-ksac': 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      }
    },
  },
  plugins: [],
}
