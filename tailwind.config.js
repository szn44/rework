/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        accent: "#7223fb",
        // Dark mode color palette
        dark: {
          bg: {
            primary: "#161616",    // Main background
            secondary: "#232323",  // Secondary background (cards, panels)
            tertiary: "#303031",   // Tertiary background (hover states, borders)
            nav: "#121212",        // Navigation background (darker)
          },
          text: {
            primary: "#ECECEC",    // Primary text
            secondary: "#82838B",  // Secondary text
            tertiary: "#7B7C83",   // Tertiary text (muted)
          }
        }
      },
      animation: {
        "spin-slow": "spin 10s linear infinite",
      },
      transitionTimingFunction: {
        "out-back": "cubic-bezier(0.34, 1.56, 0.64, 1)",
        "out-expo": "cubic-bezier(0.19, 1, 0.22, 1)",
      },
    },
  },
  plugins: [],
};
