import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        // Guest cards set --card-heading-font to the business's chosen font
        // (lib/cardFonts.ts); everywhere else this is plain Georgia.
        serif: ["var(--card-heading-font, Georgia)", "Cambria", '"Times New Roman"', "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
