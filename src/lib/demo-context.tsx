"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { fetchDemo, sendDemoAction } from "./api";
import type { ActionResult, DemoAction, DemoState } from "./types";

interface DemoContextValue {
  data: DemoState | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  act: (action: DemoAction) => Promise<ActionResult>;
}
const DemoContext = createContext<DemoContextValue | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<DemoState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetchDemo()
      .then((value) => {
        if (active) {
          setData(value);
          setError(null);
        }
      })
      .catch((cause: unknown) => {
        if (active)
          setError(
            cause instanceof Error ? cause.message : "Məlumatlar yüklənmədi.",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setData(await fetchDemo());
      setError(null);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Məlumatlar yüklənmədi.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const act = useCallback(async (action: DemoAction) => {
    try {
      const result = await sendDemoAction(action);
      setData(result.data);
      setError(null);
      return result;
    } catch (cause) {
      // Validation errors belong to the submitting form, not to other routes sharing this provider.
      const message =
        cause instanceof Error ? cause.message : "Əməliyyat tamamlanmadı.";
      throw new Error(message);
    }
  }, []);

  return (
    <DemoContext.Provider value={{ data, loading, error, refresh, act }}>
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo(): DemoContextValue {
  const context = useContext(DemoContext);
  if (!context) throw new Error("useDemo must be used inside DemoProvider");
  return context;
}
