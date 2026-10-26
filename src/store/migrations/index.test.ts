import { describe, expect, it } from "vitest";
import { migrateStorage, parseBackup } from "@/store/migrations";
import { appStorage } from "@/test/fixtures/app-data";

describe("backup validation", () => {
  it("accepts a valid V4 backup", () => {
    expect(parseBackup(JSON.stringify(appStorage())).schemaVersion).toBe(4);
  });

  it("migrates V1 appearance preferences without changing profile data", () => {
    const current = appStorage();
    const legacy = {
      ...current,
      schemaVersion: 1,
      profiles: current.profiles.map(({ preferences, ...profile }) => ({
        ...profile,
        preferences: {
          checkpointTime: preferences.checkpointTime,
          calendarView: preferences.calendarView,
          calendarDate: preferences.calendarDate,
        },
      })),
    };
    const migrated = migrateStorage(legacy);
    expect(migrated.schemaVersion).toBe(4);
    expect(migrated.profiles[0].preferences).toMatchObject({
      themeMode: "light",
      themeChoice: "auto",
    });
    expect(migrated.profiles[0].preferences.themeCustomizations.christmas).toMatchObject({
      backgroundColor: "#E8F1EB",
      accentColor: "#27724D",
      effectChoice: "snow",
    });
    expect(migrated.profiles[0].name).toBe(current.profiles[0].name);
  });

  it("migrates V2 with vivid but readable customization defaults", () => {
    const current = appStorage();
    const legacy = {
      ...current,
      schemaVersion: 2,
      profiles: current.profiles.map(({ preferences, ...profile }) => {
        const v2Preferences = {
          checkpointTime: preferences.checkpointTime,
          calendarView: preferences.calendarView,
          calendarDate: preferences.calendarDate,
          themeMode: preferences.themeMode,
          themeChoice: preferences.themeChoice,
          themeEffects: true,
        };
        return { ...profile, preferences: v2Preferences };
      }),
    };
    const migrated = migrateStorage(legacy);
    expect(migrated.profiles[0].preferences.themeCustomizations.christmas).toMatchObject({
      background: "vivid",
      effectDensity: "high",
      effectSpeed: "slow",
      effectColor: "#DDEFE8",
    });
  });

  it("keeps legacy V3 colors in Default without contaminating seasonal themes", () => {
    const current = appStorage();
    const preferences = current.profiles[0].preferences;
    const legacy = {
      ...current,
      schemaVersion: 3,
      profiles: [{
        ...current.profiles[0],
        preferences: {
          checkpointTime: preferences.checkpointTime,
          calendarView: preferences.calendarView,
          calendarDate: preferences.calendarDate,
          themeMode: preferences.themeMode,
          themeChoice: "autumn",
          themeEffects: true,
          themeBackground: "custom",
          themeEffectChoice: "sparkles",
          themeEffectDensity: "high",
          themeEffectSpeed: "fast",
          customBackground: "#112233",
          customAccent: "#445566",
          customEffectColor: "#778899",
        },
      }],
    };
    const migrated = migrateStorage(legacy);
    expect(migrated.profiles[0].preferences.themeCustomizations.default).toMatchObject({
      background: "custom",
      backgroundColor: "#112233",
      accentColor: "#445566",
      effectChoice: "sparkles",
      effectDensity: "high",
      effectSpeed: "fast",
      effectColor: "#778899",
    });
    expect(migrated.profiles[0].preferences.themeCustomizations.autumn).toMatchObject({
      background: "vivid",
      backgroundColor: "#F4E7DF",
      accentColor: "#9A4C24",
      effectChoice: "leaves",
      effectColor: "#B85F2F",
    });
    expect(migrated.profiles[0].preferences.themeCustomizations.christmas).toMatchObject({
      background: "vivid",
      backgroundColor: "#E8F1EB",
      accentColor: "#27724D",
      effectChoice: "snow",
      effectColor: "#DDEFE8",
    });
  });

  it("rejects invalid JSON without returning partial data", () => {
    expect(() => parseBackup("{oops")).toThrow("Tệp không phải JSON hợp lệ");
  });

  it("rejects a backup whose active profile does not exist", () => {
    expect(() => parseBackup(JSON.stringify({ ...appStorage(), activeProfileId: "missing" }))).toThrow("Backup không đúng schema");
  });
});
