"use client";

import { useCallback, useEffect, useState } from "react";
import { api, errorMessage } from "./api";
import type { ActivityByType, ActivityType } from "./types";

/** Loads one activity list and exposes reload/delete helpers. */
export function useActivities<T extends ActivityType>(type: T) {
  const [items, setItems] = useState<ActivityByType[T][]>([]);
  const [loading, setLoading] = useState(true);
  // Bumping this re-runs the fetch effect.
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;
    api
      .listActivities(type)
      .then((data) => !cancelled && setItems(data))
      .catch((error) => {
        console.error(`Error fetching ${type} activities:`, error);
        if (!cancelled) setItems([]);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [type, version]);

  const reload = useCallback(() => setVersion((v) => v + 1), []);

  const remove = useCallback(
    async (id: number, confirmMessage: string) => {
      if (!confirm(confirmMessage)) return;
      try {
        await api.deleteActivity(type, id);
        reload();
      } catch (error) {
        alert(`Error deleting: ${errorMessage(error)}`);
      }
    },
    [type, reload],
  );

  return { items, loading, reload, remove };
}

/** Staggered fade-in used by cards and rows. */
export function enterStyle(index: number) {
  return { animationDelay: `${100 + index * 80}ms` };
}
