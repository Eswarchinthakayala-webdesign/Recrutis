import { StrictMode, useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { ClerkProvider } from "@clerk/clerk-react";
import { dark, light } from "@clerk/themes";
import { ThemeProvider, useTheme } from "@/components/theme-provider";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
if (!PUBLISHABLE_KEY) throw new Error("Add your Clerk Publishable Key to .env");

function DynamicClerkProvider() {
  const { theme } = useTheme();
  const [currentTheme, setCurrentTheme] = useState(theme);

  // Watch for theme changes
  useEffect(() => {
    setCurrentTheme(theme);
  }, [theme]);

  // detect system dark preference
  const prefersDark =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  const activeTheme = currentTheme === "system" ? (prefersDark ? "dark" : "light") : currentTheme;

  // Force remount on theme change using key
  return (
    <ClerkProvider
      key={activeTheme}
      publishableKey={PUBLISHABLE_KEY}
      appearance={{
        baseTheme: activeTheme === "dark" ? dark : light,
       
      }}
    >
      <App />
    </ClerkProvider>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="theme">
      <DynamicClerkProvider />
    </ThemeProvider>
  </StrictMode>
);
