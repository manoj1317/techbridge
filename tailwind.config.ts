import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: { extend: { colors: { ink: "#172033", brand: { 50: "#eef5ff", 100: "#dceaff", 600: "#2563eb", 700: "#1d4ed8" } }, boxShadow: { soft: "0 18px 50px rgba(23,32,51,.08)" } } },
  plugins: []
};
export default config;
