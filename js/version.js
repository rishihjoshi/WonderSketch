// Version + update handling.
//
// RELEASE CHECKLIST — bump the SAME version string in all three places:
//   1. this file (APP_VERSION)
//   2. version.json   (the "latest deployed" marker served by GitHub Pages)
//   3. service-worker.js (CACHE_NAME derives from its own APP_VERSION const)
//
// APP_VERSION is baked into the cached app bundle, so an out-of-date phone keeps
// reporting its OLD version until the user refreshes. version.json is always
// fetched fresh from the network, so comparing the two reveals a pending update.

export const APP_VERSION = "1.0.2";

const VERSION_URL = "version.json";

// True when a different, valid version is available on the server.
export function isUpdateAvailable(current, latest) {
  return typeof latest === "string" && latest.length > 0 && latest !== current;
}

// Fetch the latest deployed version, bypassing both the HTTP cache and the
// service-worker cache (the SW serves version.json network-only; the query
// string + no-store defeat any intermediate caching).
export async function fetchLatestVersion() {
  const res = await fetch(`${VERSION_URL}?t=${Date.now()}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`version fetch failed: ${res.status}`);
  const data = await res.json();
  return typeof data.version === "string" ? data.version : null;
}

// Wipe every cache, pull a fresh service worker, then hard-reload from the
// network so the phone picks up the newly deployed files from GitHub Pages.
export async function forceRefresh() {
  try {
    if ("serviceWorker" in navigator) {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg) {
        try {
          await reg.update();
        } catch {
          /* update fetch failed — cache clear + reload below still helps */
        }
      }
    }
    if ("caches" in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    }
  } finally {
    location.reload();
  }
}
