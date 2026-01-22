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
                    50: "#FFF0F4",
                    100: "#FFE0E9",
                    200: "#FFC1D3",
                    300: "#FFA2BD",
                    400: "#FF73A1",
                    500: "#FF4D7A",  // Lighter Watcha pink
                    600: "#FF2F62",  // Main Watcha pink
                    700: "#E02854",  // Darker shade
                    800: "#B31F43",
                    900: "#8C1833",
                },
                secondary: {
                    50: "#F0F9FF",
                    100: "#E0F2FE",
                    200: "#BAE6FD",
                    300: "#7DD3FC",
                    400: "#38BDF8",
                    500: "#0EA5E9",
                    600: "#0284C7",
                    700: "#0369A1",
                    800: "#075985",
                    900: "#0C4A6E",
                },
                neutral: {
                    50: "#FAFAFA",
                    100: "#F5F5F5",
                    200: "#E5E5E5",
                    300: "#D4D4D4",
                    400: "#A3A3A3",
                    500: "#737373",
                    600: "#74747B",  // Watcha secondary text
                    700: "#525252",
                    800: "#404040",
                    900: "#292A32",  // Watcha dark text
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
