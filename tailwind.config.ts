import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: "#fef3e2",
                    100: "#fde4ba",
                    200: "#fcd48d",
                    300: "#fbc360",
                    400: "#fab740",
                    500: "#f9ab20",
                    600: "#e99b1c",
                    700: "#d68718",
                    800: "#c37414",
                    900: "#a4520d",
                },
                secondary: {
                    50: "#e8f5e9",
                    100: "#c8e6c9",
                    200: "#a5d6a7",
                    300: "#81c784",
                    400: "#66bb6a",
                    500: "#4caf50",
                    600: "#43a047",
                    700: "#388e3c",
                    800: "#2e7d32",
                    900: "#1b5e20",
                },
                neutral: {
                    50: "#f9fafb",
                    100: "#f3f4f6",
                    200: "#e5e7eb",
                    300: "#d1d5db",
                    400: "#9ca3af",
                    500: "#6b7280",
                    600: "#4b5563",
                    700: "#374151",
                    800: "#1f2937",
                    900: "#111827",
                },
            },
            fontFamily: {
                sans: ["var(--font-inter)", "system-ui", "sans-serif"],
                display: ["var(--font-outfit)", "system-ui", "sans-serif"],
            },
            animation: {
                "fade-in": "fade-in 0.5s ease-in-out",
                "slide-up": "slide-up 0.5s ease-out",
                "slide-down": "slide-down 0.5s ease-out",
                bounce: "bounce 1s infinite",
            },
            keyframes: {
                "fade-in": {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
                "slide-up": {
                    "0%": { transform: "translateY(20px)", opacity: "0" },
                    "100%": { transform: "translateY(0)", opacity: "1" },
                },
                "slide-down": {
                    "0%": { transform: "translateY(-20px)", opacity: "0" },
                    "100%": { transform: "translateY(0)", opacity: "1" },
                },
            },
        },
    },
    plugins: [],
};

export default config;
