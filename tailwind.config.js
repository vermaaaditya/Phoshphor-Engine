/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "background": "#131313",
        "on-background": "#e4e2e1",
        "surface": "#131313",
        "surface-container-lowest": "#0e0e0e",
        "surface-container-low": "#1b1c1c",
        "surface-container-high": "#2a2a2a",
        "surface-variant": "#353535",
        "on-surface": "#e4e2e1",
        "on-surface-variant": "#b9cacb",
        "outline-variant": "#3b494b",
        "accent-pop": "var(--accent-pop)", 
      },
      spacing: {
        "grid-line": "1px",
        "margin-lg": "64px",
        "margin-md": "32px",
        "margin-sm": "16px"
      },
      fontFamily: {
        "data-mono": ["JetBrains Mono", "monospace"],
        "body-md": ["JetBrains Mono", "monospace"],
        "headline-lg": ["JetBrains Mono", "monospace"],
        "label-caps": ["JetBrains Mono", "monospace"]
      },
      fontSize: {
        "data-mono": ["12px", { lineHeight: "1.0", fontWeight: "500" }],
        "body-md": ["14px", { lineHeight: "1.6", letterSpacing: "-0.01em", fontWeight: "400" }],
        "headline-lg": ["40px", { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "700" }],
        "label-caps": ["10px", { lineHeight: "1.2", letterSpacing: "0.15em", fontWeight: "700" }]
      }
    },
  },
  plugins: [],
}
