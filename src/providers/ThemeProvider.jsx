import { useEffect } from "react";
import { useThemeStore } from "../stores/useThemeStore";

export const ThemeProvider = ({ children }) => {
  const isDarkMode = useThemeStore((state) => state.isDarkMode);

  useEffect(() => {
    const html = document.documentElement;
    if (isDarkMode) {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
  }, [isDarkMode]);

  return <>{children}</>;
};
