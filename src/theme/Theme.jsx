import { useThemeStore } from "../stores/useThemeStore";

export const useTheme = () => {
  const isDark = useThemeStore((state) => state.isDarkMode);

  const theme = {
    bg: isDark ? "bg-slate-950" : "bg-slate-50",
    text: isDark ? "text-white" : "text-slate-900",
    textMuted: isDark ? "text-slate-400" : "text-slate-600",

    navBg: isDark
      ? "bg-slate-950/70 border-white/5"
      : "bg-white/70 border-slate-200",

    cardBg: isDark
      ? "bg-white/5 border-white/5 hover:bg-white/10"
      : "bg-white border-slate-200 shadow-sm hover:shadow-md",

    bubbleOther: isDark
      ? "bg-slate-800/80 border-white/10"
      : "bg-white/80 border-slate-200 shadow-lg",

    bubbleTextOther: isDark ? "text-white" : "text-slate-800",

    footer: isDark
      ? "bg-slate-950 border-white/5"
      : "bg-slate-100 border-slate-200",

    blobBlue: isDark ? "bg-blue-600/20" : "bg-blue-400/20",
    blobPurple: isDark ? "bg-purple-600/20" : "bg-purple-400/20",

    container: isDark
      ? "bg-slate-900 border-white/10"
      : "bg-white border-slate-200",
    inputBg: isDark
      ? "bg-slate-950 border-white/10 focus:border-cyan-500"
      : "bg-slate-50 border-slate-200 focus:border-cyan-500",
    inputIcon: isDark ? "text-slate-500" : "text-slate-400",
    errorBg: isDark
      ? "bg-red-500/10 text-red-400 border-red-500/20"
      : "bg-red-50 text-red-600 border-red-200",
  };

  return theme;
};
