const CACHE_NAME = "wondersketch-v8";

const PRECACHE_URLS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./css/styles.css",
  "./js/app.js",
  "./js/camera.js",
  "./js/overlay.js",
  "./js/grid.js",
  "./js/perspective.js",
  "./js/calligraphy.js",
  "./js/templates.js",
  "./js/learn.js",
  "./js/challenges.js",
  "./js/storage.js",
  "./js/wakelock.js",
  "./js/db.js",
  "./libs/fabric.min.js",
  "./libs/dexie.min.js",
  "./assets/icons/icon-72.png",
  "./assets/icons/icon-96.png",
  "./assets/icons/icon-128.png",
  "./assets/icons/icon-144.png",
  "./assets/icons/icon-152.png",
  "./assets/icons/icon-180.png",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-384.png",
  "./assets/icons/icon-512.png",
  "./assets/icons/maskable-192.png",
  "./assets/icons/maskable-512.png",
  "./assets/icons/apple-touch-icon.png",
  "./assets/icons/favicon-16.png",
  "./assets/icons/favicon-32.png",
  "./assets/templates/anime-face.svg",
  "./assets/templates/anime-eyes.svg",
  "./assets/templates/animal-cat.svg",
  "./assets/templates/animal-dog.svg",
  "./assets/templates/flower-rose.svg",
  "./assets/templates/flower-daisy.svg",
  "./assets/templates/vehicle-car.svg",
  "./assets/templates/vehicle-bike.svg",
  "./assets/templates/calligraphy-flourish.svg",
  "./assets/templates/tattoo-tribal.svg",
  "./assets/templates/tattoo-rose.svg",
  "./assets/templates/kids-star.svg",
  "./assets/templates/kids-house.svg",
  "./assets/templates/faces-portrait.svg",
  "./assets/templates/faces-profile.svg",
  "./assets/templates/flower-sunflower.svg",
  "./assets/templates/flower-tulip.svg",
  "./assets/templates/scenery-eiffel.svg",
  "./assets/templates/scenery-sunset.svg",
  "./assets/templates/fantasy-unicorn.svg",
  "./assets/templates/fantasy-butterfly.svg",
  "./assets/templates/fantasy-rainbow.svg",
  "./assets/templates/fantasy-cupcake.svg",
  "./assets/templates/fantasy-heart.svg",
  "./assets/templates/fantasy-crown.svg",
  "./assets/templates/faces-girl-front.svg",
  "./assets/templates/faces-side-profile-detailed.svg",
  "./assets/templates/faces-eye-study.svg",
  "./assets/templates/faces-girl-pigtails.svg",
  "./assets/templates/scenery-eiffel-detailed.svg",
  "./assets/templates/faces-girl-ponytail.svg",
  "./assets/templates/scenery-eiffel-ultra.svg",
  "./assets/templates/landmark-bigben.svg",
  "./assets/templates/landmark-statue-liberty.svg",
  "./assets/templates/landmark-taj-mahal.svg",
  "./assets/templates/landmark-golden-gate.svg",
  "./assets/templates/landmark-pisa.svg",
  "./assets/templates/landmark-burj-khalifa.svg",
  "./assets/templates/landmark-opera-house.svg",
  "./assets/templates/landmark-colosseum.svg",
  "./assets/templates/landmark-pyramids.svg",
  "./assets/templates/landmark-castle.svg",
  "./assets/templates/landmark-lighthouse.svg",
  "./assets/templates/landmark-windmill.svg",
  "./assets/templates/animal-cat-ultra.svg",
  "./assets/templates/animal-dog-ultra.svg",
  "./assets/templates/animal-horse-ultra.svg",
  "./assets/templates/vehicle-car-ultra.svg",
  "./assets/templates/vehicle-airplane.svg",
  "./assets/templates/vehicle-sailboat.svg",
  "./assets/templates/fantasy-dragon-ultra.svg",
  "./assets/templates/nature-tree-ultra.svg",
  "./assets/templates/nature-mountain-ultra.svg",
  "./assets/templates/animal-owl-ultra.svg",
  "./assets/templates/animal-elephant-ultra.svg",
  "./assets/templates/flower-rose-ultra.svg",
  "./assets/templates/flower-orchid.svg",
  "./assets/templates/vehicle-train.svg",
  "./assets/templates/vehicle-motorcycle-ultra.svg",
  "./assets/templates/fantasy-mermaid.svg",
  "./assets/templates/fantasy-phoenix.svg",
  "./assets/templates/kids-robot.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request)
        .then((response) => {
          if (response.ok && response.type === "basic") {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => {
          if (request.mode === "navigate") {
            return caches.match("./index.html");
          }
          return new Response("", { status: 504, statusText: "Offline" });
        });
    })
  );
});
