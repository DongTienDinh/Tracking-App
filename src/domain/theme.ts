import type { ThemeChoice, ThemeCustomization, ThemeCustomizations, ThemePreset } from "@/domain/types";

export type ResolvedTheme = ThemePreset;
export type ThemeEffect = "none" | "petals" | "sunlight" | "leaves" | "snow" | "confetti" | "sparkles";

export const THEME_LABELS: Record<ThemeChoice, string> = {
  default: "Mặc định",
  auto: "Tự động theo thời điểm",
  spring: "Mùa xuân",
  summer: "Mùa hè",
  autumn: "Mùa thu",
  winter: "Mùa đông",
  tet: "Tết",
  christmas: "Giáng sinh",
  "national-day": "Quốc khánh",
};

const EFFECT_BY_THEME: Record<ResolvedTheme, ThemeEffect> = {
  default: "none",
  spring: "petals",
  summer: "sunlight",
  autumn: "leaves",
  winter: "snow",
  tet: "petals",
  christmas: "snow",
  "national-day": "confetti",
};

const DEFAULT_THEME_CUSTOMIZATIONS: ThemeCustomizations = {
  default: {
    background: "soft", backgroundColor: "#E7F1EF", accentColor: "#1B6E66",
    effectsEnabled: false, effectChoice: "auto", effectDensity: "low", effectSpeed: "normal", effectColor: "#63B8AA",
  },
  spring: {
    background: "vivid", backgroundColor: "#F8E9ED", accentColor: "#A94F6B",
    effectsEnabled: true, effectChoice: "petals", effectDensity: "medium", effectSpeed: "slow", effectColor: "#DC7897",
  },
  summer: {
    background: "vivid", backgroundColor: "#FFF1DA", accentColor: "#A95E08",
    effectsEnabled: true, effectChoice: "sunlight", effectDensity: "medium", effectSpeed: "normal", effectColor: "#E8A839",
  },
  autumn: {
    background: "vivid", backgroundColor: "#F4E7DF", accentColor: "#9A4C24",
    effectsEnabled: true, effectChoice: "leaves", effectDensity: "medium", effectSpeed: "slow", effectColor: "#B85F2F",
  },
  winter: {
    background: "vivid", backgroundColor: "#E9F2F4", accentColor: "#356D86",
    effectsEnabled: true, effectChoice: "snow", effectDensity: "high", effectSpeed: "slow", effectColor: "#B9DCE9",
  },
  tet: {
    background: "vivid", backgroundColor: "#FAEAE5", accentColor: "#A52B28",
    effectsEnabled: true, effectChoice: "petals", effectDensity: "high", effectSpeed: "normal", effectColor: "#D3423C",
  },
  christmas: {
    background: "vivid", backgroundColor: "#E8F1EB", accentColor: "#27724D",
    effectsEnabled: true, effectChoice: "snow", effectDensity: "high", effectSpeed: "slow", effectColor: "#DDEFE8",
  },
  "national-day": {
    background: "vivid", backgroundColor: "#F8E8E7", accentColor: "#A51F28",
    effectsEnabled: true, effectChoice: "confetti", effectDensity: "high", effectSpeed: "normal", effectColor: "#E4B539",
  },
};

export function defaultThemeCustomization(theme: ResolvedTheme): ThemeCustomization {
  return { ...DEFAULT_THEME_CUSTOMIZATIONS[theme] };
}

export function createDefaultThemeCustomizations(): ThemeCustomizations {
  return {
    default: defaultThemeCustomization("default"),
    spring: defaultThemeCustomization("spring"),
    summer: defaultThemeCustomization("summer"),
    autumn: defaultThemeCustomization("autumn"),
    winter: defaultThemeCustomization("winter"),
    tet: defaultThemeCustomization("tet"),
    christmas: defaultThemeCustomization("christmas"),
    "national-day": defaultThemeCustomization("national-day"),
  };
}

function isTet(date: Date): boolean {
  try {
    const parts = new Intl.DateTimeFormat("en-u-ca-chinese", {
      month: "numeric",
      day: "numeric",
      timeZone: "Asia/Ho_Chi_Minh",
    }).formatToParts(date);
    const monthPart = parts.find((part) => part.type === "month")?.value ?? "";
    const day = Number(parts.find((part) => part.type === "day")?.value);
    return Number.parseInt(monthPart, 10) === 1 && day >= 1 && day <= 7;
  } catch {
    return false;
  }
}

export function resolveAutomaticTheme(date: Date): ResolvedTheme {
  const month = date.getMonth() + 1;
  const day = date.getDate();

  if (isTet(date)) return "tet";
  if (month === 12 && day >= 20 && day <= 26) return "christmas";
  if ((month === 8 && day === 31) || (month === 9 && day <= 2)) return "national-day";
  if (month >= 3 && month <= 5) return "spring";
  if (month >= 6 && month <= 8) return "summer";
  if (month >= 9 && month <= 11) return "autumn";
  return "winter";
}

export function resolveTheme(choice: ThemeChoice, date = new Date()): ResolvedTheme {
  return choice === "auto" ? resolveAutomaticTheme(date) : choice;
}

export function effectForTheme(theme: ResolvedTheme): ThemeEffect {
  return EFFECT_BY_THEME[theme];
}
