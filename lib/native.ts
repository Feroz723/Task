import { AD_TEST_IDS } from "@/lib/halo-data";

function isNativeCapacitor() {
  if (typeof window === "undefined") return false;
  const cap = (window as Window & { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
  return Boolean(cap?.isNativePlatform?.());
}

export async function pulseCompletion() {
  if (typeof window === "undefined") return;

  try {
    if (isNativeCapacitor()) {
      const { Haptics, ImpactStyle } = await import("@capacitor/haptics");
      await Haptics.impact({ style: ImpactStyle.Light });
      return;
    }
  } catch {
    // Browser vibration below is the graceful fallback.
  }

  if ("vibrate" in navigator) {
    navigator.vibrate(18);
  }
}

export async function initializeAdMob() {
  if (!isNativeCapacitor()) return false;

  try {
    const { AdMob } = await import("@capacitor-community/admob");
    await AdMob.initialize({
      testingDevices: [],
      initializeForTesting: true
    });
    return true;
  } catch {
    return false;
  }
}

export async function showNativeInterstitial() {
  if (!isNativeCapacitor()) return false;

  try {
    const { AdMob } = await import("@capacitor-community/admob");
    await AdMob.prepareInterstitial({
      adId: AD_TEST_IDS.interstitial,
      isTesting: true
    });
    await AdMob.showInterstitial();
    return true;
  } catch {
    return false;
  }
}

export async function showNativeRewarded() {
  if (!isNativeCapacitor()) return false;

  try {
    const { AdMob } = await import("@capacitor-community/admob");
    await AdMob.prepareRewardVideoAd({
      adId: AD_TEST_IDS.rewarded,
      isTesting: true
    });
    await AdMob.showRewardVideoAd();
    return true;
  } catch {
    return false;
  }
}

export function registerServiceWorker() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

  if (process.env.NODE_ENV === "development") {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister().then((success) => {
          if (success) {
            console.log("Unregistered service worker in development mode to prevent chunk caching.");
          }
        });
      }
    });
    return;
  }

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => undefined);
  });
}
