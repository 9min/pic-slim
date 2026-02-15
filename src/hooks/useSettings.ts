import { useState, useEffect } from "react";
import type { CompressionSettings } from "../types";
import { getDefaultOutputDir } from "../lib/tauri";

const SETTINGS_KEY = "picslim_settings";

const DEFAULT_SETTINGS: CompressionSettings = {
  quality: 90,
  output_dir: "",
};

export function useSettings() {
  const [settings, setSettings] = useState<CompressionSettings>(() => {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_SETTINGS;
      }
    }
    return DEFAULT_SETTINGS;
  });

  useEffect(() => {
    if (!settings.output_dir) {
      getDefaultOutputDir().then((dir) => {
        setSettings((prev) => ({ ...prev, output_dir: dir }));
      });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  const updateQuality = (quality: number) => {
    setSettings((prev) => ({ ...prev, quality }));
  };

  const updateOutputDir = (output_dir: string) => {
    setSettings((prev) => ({ ...prev, output_dir }));
  };

  return { settings, updateQuality, updateOutputDir };
}
