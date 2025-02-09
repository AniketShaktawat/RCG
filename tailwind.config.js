/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./views/**/*.ejs",
    "./public/**/*.js"
  ],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius, 8px)",
        md: "calc(var(--radius, 8px) - 2px)",
        sm: "calc(var(--radius, 8px) - 4px)",
      },
      colors: {
        // ... your custom HSL color variables
        background: "hsl(var(--background, 0 0% 100%))",
        // etc.
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0px" },
          to: { height: "var(--radix-accordion-content-height, auto)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height, auto)" },
          to: { height: "0px" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/typography"),
  ],
};
