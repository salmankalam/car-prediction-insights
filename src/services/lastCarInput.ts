/**
 * Tiny module-level store so BudgetSection can read the most-recently
 * submitted CarInput from PredictSection without a router refactor.
 */
import { useSyncExternalStore } from "react";
import type { CarInput } from "@/services/predictionService";

let current: CarInput | null = null;
const listeners = new Set<() => void>();

export function setLastCarInput(input: CarInput) {
  current = input;
  listeners.forEach((l) => l());
}

export function useLastCarInput(): CarInput | null {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => current,
    () => current,
  );
}
