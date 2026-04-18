import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#171717",
        paper: "#f7f5ef",
        line: "#d9d2c3",
        leaf: "#2f6f4e",
        river: "#2b6f8a",
        ember: "#b84a35",
        sun: "#d9a441"
      },
      borderRadius: {
        lg: "8px",
        md: "6px",
        sm: "4px"
      },
      boxShadow: {
        panel: "0 16px 40px rgba(23, 23, 23, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
