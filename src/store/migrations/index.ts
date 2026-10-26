import type { AppStorage, ThemeBackground, ThemeEffectChoice, ThemeEffectDensity, ThemeEffectSpeed } from "@/domain/types";
import { createDefaultThemeCustomizations } from "@/domain/theme";
import { appStorageSchema } from "@/lib/validation";

const DEFAULT_THEME_PREFERENCES = {
  themeMode: "light" as const,
  themeChoice: "auto" as const,
  themeEffects: true,
};

const DEFAULT_THEME_CUSTOMIZATION = {
  themeBackground: "vivid" as const,
  themeEffectChoice: "auto" as const,
  themeEffectDensity: "medium" as const,
  themeEffectSpeed: "normal" as const,
  customBackground: "#F2A65A",
  customAccent: "#D95D39",
  customEffectColor: "#FFD166",
};

function migrateV1(input: Record<string, unknown>): unknown {
  const profiles = Array.isArray(input.profiles)
    ? input.profiles.map((profile) => {
        if (typeof profile !== "object" || profile === null) return profile;
        const preferences = "preferences" in profile && typeof profile.preferences === "object" && profile.preferences !== null
          ? profile.preferences
          : {};
        return { ...profile, preferences: { ...preferences, ...DEFAULT_THEME_PREFERENCES } };
      })
    : input.profiles;
  return { ...input, schemaVersion: 2, profiles };
}

function migrateV2(input: Record<string, unknown>): unknown {
  const profiles = Array.isArray(input.profiles)
    ? input.profiles.map((profile) => {
        if (typeof profile !== "object" || profile === null) return profile;
        const preferences = "preferences" in profile && typeof profile.preferences === "object" && profile.preferences !== null
          ? profile.preferences
          : {};
        return { ...profile, preferences: { ...preferences, ...DEFAULT_THEME_CUSTOMIZATION } };
      })
    : input.profiles;
  return { ...input, schemaVersion: 3, profiles };
}

const V3_THEME_KEYS = new Set([
  "themeEffects", "themeBackground", "themeEffectChoice", "themeEffectDensity", "themeEffectSpeed",
  "customBackground", "customAccent", "customEffectColor",
]);

function migrateV3(input: Record<string, unknown>): unknown {
  const profiles = Array.isArray(input.profiles)
    ? input.profiles.map((profile) => {
        if (typeof profile !== "object" || profile === null) return profile;
        const preferences = "preferences" in profile && typeof profile.preferences === "object" && profile.preferences !== null
          ? profile.preferences as Record<string, unknown>
          : {};
        const themeCustomizations = createDefaultThemeCustomizations();
        themeCustomizations.default = {
          ...themeCustomizations.default,
          background: (preferences.themeBackground ?? "vivid") as ThemeBackground,
          backgroundColor: typeof preferences.customBackground === "string" ? preferences.customBackground : themeCustomizations.default.backgroundColor,
          accentColor: typeof preferences.customAccent === "string" ? preferences.customAccent : themeCustomizations.default.accentColor,
          effectsEnabled: typeof preferences.themeEffects === "boolean" ? preferences.themeEffects : true,
          effectChoice: (preferences.themeEffectChoice ?? "auto") as ThemeEffectChoice,
          effectDensity: (preferences.themeEffectDensity ?? "medium") as ThemeEffectDensity,
          effectSpeed: (preferences.themeEffectSpeed ?? "normal") as ThemeEffectSpeed,
          effectColor: typeof preferences.customEffectColor === "string" ? preferences.customEffectColor : themeCustomizations.default.effectColor,
        };
        const currentPreferences = Object.fromEntries(Object.entries(preferences).filter(([key]) => !V3_THEME_KEYS.has(key)));
        return { ...profile, preferences: { ...currentPreferences, themeCustomizations } };
      })
    : input.profiles;
  return { ...input, schemaVersion: 4, profiles };
}

export function migrateStorage(input: unknown): AppStorage {
  const candidate = typeof input === "object" && input !== null && "state" in input
    ? (input as { state: unknown }).state
    : input;
  let migrated: unknown = candidate;
  if (typeof migrated === "object" && migrated !== null && "schemaVersion" in migrated && migrated.schemaVersion === 1) {
    migrated = migrateV1(migrated as Record<string, unknown>);
  }
  if (typeof migrated === "object" && migrated !== null && "schemaVersion" in migrated && migrated.schemaVersion === 2) {
    migrated = migrateV2(migrated as Record<string, unknown>);
  }
  if (typeof migrated === "object" && migrated !== null && "schemaVersion" in migrated && migrated.schemaVersion === 3) {
    migrated = migrateV3(migrated as Record<string, unknown>);
  }
  return appStorageSchema.parse(migrated) as AppStorage;
}

export function parseBackup(json: string): AppStorage {
  let data: unknown;
  try {
    data = JSON.parse(json);
  } catch {
    throw new Error("Tệp không phải JSON hợp lệ.");
  }
  try {
    return migrateStorage(data);
  } catch {
    throw new Error("Backup không đúng schema App Tracking.");
  }
}
