let wakeLock = null;

export async function enableWakeLock() {
  if (!("wakeLock" in navigator)) return false;
  try {
    wakeLock = await navigator.wakeLock.request("screen");
    wakeLock.addEventListener("release", () => {
      wakeLock = null;
    });
    return true;
  } catch {
    return false;
  }
}

export async function disableWakeLock() {
  if (wakeLock) {
    await wakeLock.release();
    wakeLock = null;
  }
}

export function isWakeLockActive() {
  return !!wakeLock;
}

export function reacquireOnVisible(getDesiredState) {
  document.addEventListener("visibilitychange", async () => {
    if (document.visibilityState === "visible" && getDesiredState() && !wakeLock) {
      await enableWakeLock();
    }
  });
}
