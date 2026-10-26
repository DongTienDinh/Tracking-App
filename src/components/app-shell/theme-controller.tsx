"use client";

import { useEffect } from "react";
import type { ProfilePreferences } from "@/domain/types";
import { effectForTheme, resolveTheme } from "@/domain/theme";

const PARTICLES = Array.from({ length: 36 }, (_, index) => index);

type ThemeControllerProps = Pick<ProfilePreferences, "themeMode" | "themeChoice" | "themeCustomizations">;

export function ThemeController({ themeMode, themeChoice, themeCustomizations }: ThemeControllerProps) {
  const resolvedTheme = resolveTheme(themeChoice);
  const customization = themeCustomizations[resolvedTheme];
  const automaticEffect = effectForTheme(resolvedTheme);
  const effect = customization.effectsEnabled ? (customization.effectChoice === "auto" ? automaticEffect : customization.effectChoice) : "none";
  const speedMultiplier = customization.effectSpeed === "slow" ? 1.45 : customization.effectSpeed === "fast" ? 0.68 : 1;

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.mode = themeMode;
    root.dataset.theme = resolvedTheme;
    root.dataset.themeChoice = themeChoice;
    root.dataset.themeBackground = customization.background;
    root.dataset.effectDensity = customization.effectDensity;
    root.dataset.effectSpeed = customization.effectSpeed;
    root.style.colorScheme = themeMode;
    root.style.setProperty("--custom-background", customization.backgroundColor);
    root.style.setProperty("--custom-accent", customization.accentColor);
    root.style.setProperty("--custom-effect", customization.effectColor);
    root.style.setProperty("--effect-primary", customization.effectColor);
    root.style.setProperty("--effect-secondary", customization.accentColor);
    return () => {
      delete root.dataset.mode;
      delete root.dataset.theme;
      delete root.dataset.themeChoice;
      delete root.dataset.themeBackground;
      delete root.dataset.effectDensity;
      delete root.dataset.effectSpeed;
      root.style.colorScheme = "";
      root.style.removeProperty("--custom-background");
      root.style.removeProperty("--custom-accent");
      root.style.removeProperty("--custom-effect");
      root.style.removeProperty("--effect-primary");
      root.style.removeProperty("--effect-secondary");
    };
  }, [customization.accentColor, customization.background, customization.backgroundColor, customization.effectColor, customization.effectDensity, customization.effectSpeed, resolvedTheme, themeChoice, themeMode]);

  return effect === "none" ? null : (
    <div className={`seasonal-effect effect-${effect}`} data-testid="seasonal-effect" aria-hidden="true">
      {PARTICLES.map((particle) => (
        <span
          key={particle}
          style={{
            "--particle-x": `${(particle * 17 + 3) % 101}%`,
            "--particle-delay": `-${(particle * 1.7).toFixed(1)}s`,
            "--particle-duration": `${(speedMultiplier * (9 + (particle % 7) * 1.15)).toFixed(2)}s`,
            "--particle-drift": `${-64 + (particle % 9) * 16}px`,
            "--particle-scale": `${0.72 + (particle % 5) * 0.12}`,
          } as React.CSSProperties}
        ><i /></span>
      ))}
    </div>
  );
}
