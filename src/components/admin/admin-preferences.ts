"use client";

import { useMemo, useSyncExternalStore } from "react";

export type AdminPreferences = {
  period: string;
  pageSize: number;
  density: "comfortable" | "compact";
};

export const defaultPreferences: AdminPreferences = {
  period: "2026-09",
  pageSize: 8,
  density: "comfortable",
};

const storageKey = "sumqayit.admin.preferences.v1";
const changedEvent = "sumqayit-admin-preferences";
const defaultSnapshot = JSON.stringify(defaultPreferences);

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(changedEvent, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(changedEvent, onChange);
  };
}

function getSnapshot() {
  try {
    return window.localStorage.getItem(storageKey) || defaultSnapshot;
  } catch {
    return defaultSnapshot;
  }
}

export function useAdminPreferences() {
  const snapshot = useSyncExternalStore(
    subscribe,
    getSnapshot,
    () => defaultSnapshot,
  );
  const preferences = useMemo<AdminPreferences>(() => {
    try {
      const value = JSON.parse(snapshot) as Partial<AdminPreferences>;
      return {
        period:
          typeof value.period === "string" &&
          /^20\d{2}-(0[1-9]|1[0-2])$/.test(value.period)
            ? value.period
            : defaultPreferences.period,
        pageSize: [8, 16, 32].includes(value.pageSize ?? 0)
          ? value.pageSize!
          : defaultPreferences.pageSize,
        density: value.density === "compact" ? "compact" : "comfortable",
      };
    } catch {
      return defaultPreferences;
    }
  }, [snapshot]);

  function savePreferences(value: AdminPreferences) {
    window.localStorage.setItem(storageKey, JSON.stringify(value));
    window.dispatchEvent(new Event(changedEvent));
  }

  return { preferences, savePreferences };
}
