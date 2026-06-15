import type { HaloState } from "@/lib/halo-data";
import { getInitialState } from "@/lib/halo-data";

const STORAGE_KEY = "halo.task-manager.state.v1";

function isNativeCapacitor() {
  if (typeof window === "undefined") return false;
  const cap = (window as Window & { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
  return Boolean(cap?.isNativePlatform?.());
}

export async function loadHaloState(): Promise<HaloState> {
  const fallback = getInitialState();

  try {
    if (isNativeCapacitor()) {
      const { Preferences } = await import("@capacitor/preferences");
      const result = await Preferences.get({ key: STORAGE_KEY });
      if (result.value) return { ...fallback, ...JSON.parse(result.value) };
    }

    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback;
  } catch {
    return fallback;
  }
}

export async function saveHaloState(state: HaloState) {
  const serialized = JSON.stringify(state);
  window.localStorage.setItem(STORAGE_KEY, serialized);

  if (isNativeCapacitor()) {
    const { Preferences } = await import("@capacitor/preferences");
    await Preferences.set({ key: STORAGE_KEY, value: serialized });
  }
}

export async function clearHaloState() {
  window.localStorage.removeItem(STORAGE_KEY);

  if (isNativeCapacitor()) {
    const { Preferences } = await import("@capacitor/preferences");
    await Preferences.remove({ key: STORAGE_KEY });
  }
}
