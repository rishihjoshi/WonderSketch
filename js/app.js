import * as camera from "./camera.js";
import * as overlay from "./overlay.js";
import { drawGrid } from "./grid.js";
import { drawPerspective } from "./perspective.js";
import { renderCalligraphyImage } from "./calligraphy.js";
import { CATEGORIES, DIFFICULTIES, getTemplatesByCategory, filterTemplates, getTemplateUrl, getTemplateById } from "./templates.js";
import { LESSONS } from "./learn.js";
import { getTodaysChallenge, computeStreak } from "./challenges.js";
import { getSetting, setSetting, todayString } from "./storage.js";
import * as wakelock from "./wakelock.js";
import * as db from "./db.js";
import { APP_VERSION, fetchLatestVersion, isUpdateAvailable, forceRefresh } from "./version.js";

// ---------- DOM references ----------
const stageEl = document.getElementById("stage");
const videoEl = document.getElementById("camera-feed");
const overlayCanvasEl = document.getElementById("overlay-canvas");
const guideCanvasEl = document.getElementById("guide-canvas");
const cameraPlaceholder = document.getElementById("camera-placeholder");
const startCameraBtn = document.getElementById("start-camera-btn");
const toastEl = document.getElementById("stage-toast");

const importInput = document.getElementById("import-image");
const btnMirrorH = document.getElementById("btn-mirror-h");
const btnMirrorV = document.getElementById("btn-mirror-v");
const btnLock = document.getElementById("btn-lock");
const btnReset = document.getElementById("btn-reset");
const opacitySlider = document.getElementById("opacity-slider");
const rotateSlider = document.getElementById("rotate-slider");
const gridSelect = document.getElementById("grid-select");
const perspectiveSelect = document.getElementById("perspective-select");
const btnCalligraphy = document.getElementById("btn-calligraphy");
const btnCameraToggle = document.getElementById("btn-camera-toggle");
const btnWakelock = document.getElementById("btn-wakelock");
const btnSnapshot = document.getElementById("btn-snapshot");
const zoomSlider = document.getElementById("zoom-slider");
const btnPaperFrame = document.getElementById("btn-paper-frame");
const paperMask = document.getElementById("paper-mask");

const drawerBackdrop = document.getElementById("drawer-backdrop");

// ---------- Toast ----------
let toastTimer = null;
function showToast(message, ms = 2200) {
  toastEl.textContent = message;
  toastEl.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (toastEl.hidden = true), ms);
}

// ---------- Camera ----------
async function tryStartCamera() {
  if (!camera.isCameraSupported()) {
    showToast("Camera not supported on this device.");
    return;
  }
  try {
    await camera.startCamera(videoEl);
    cameraPlaceholder.classList.add("hidden");
    applyMirrorSetting();
  } catch (err) {
    showToast("Camera permission denied or unavailable.");
    cameraPlaceholder.classList.remove("hidden");
  }
}

startCameraBtn.addEventListener("click", tryStartCamera);

btnCameraToggle.addEventListener("click", async () => {
  if (!camera.isCameraActive()) {
    await tryStartCamera();
    return;
  }
  try {
    await camera.switchCamera(videoEl);
    applyMirrorSetting();
  } catch {
    showToast("Unable to switch camera.");
  }
});

let videoMirrored = false;

function applyVideoTransform() {
  const facing = camera.getFacingMode();
  // Front camera mirrors by default (selfie view); the down-facing rear camera
  // in a tracing box can also read reversed vs the hand, so it has its own toggle.
  videoMirrored =
    facing === "user"
      ? getSetting("mirrorFront", true)
      : getSetting("mirrorRear", false);
  const zoom = getSetting("cameraZoom", 1);
  const sx = zoom * (videoMirrored ? -1 : 1);
  videoEl.style.transform = `scale(${sx}, ${zoom})`;
}

// Backwards-compatible alias used across the file.
const applyMirrorSetting = applyVideoTransform;

// ---------- Overlay canvas (Fabric) ----------
overlay.initOverlayCanvas(overlayCanvasEl, stageEl);

// ---------- Guide canvas (grid + perspective) ----------
const guideCtx = guideCanvasEl.getContext("2d");

function resizeGuideCanvas() {
  const dpr = window.devicePixelRatio || 1;
  // Backing store at device resolution (crisp on hi-dpi tablets), CSS size 100%.
  guideCanvasEl.width = stageEl.clientWidth * dpr;
  guideCanvasEl.height = stageEl.clientHeight * dpr;
  guideCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  redrawGuides();
}

function redrawGuides() {
  // Draw in CSS pixels; the context is pre-scaled by devicePixelRatio.
  const w = stageEl.clientWidth;
  const h = stageEl.clientHeight;
  guideCtx.clearRect(0, 0, w, h);
  drawGrid(guideCtx, w, h, gridSelect.value);
  drawPerspective(guideCtx, w, h, perspectiveSelect.value);
}

function sizeCanvases() {
  resizeGuideCanvas();
  overlay.resizeCanvas(stageEl);
}

window.addEventListener("resize", resizeGuideCanvas);

// Re-size canvases whenever the stage actually changes size — covers cold-start
// layout races, orientation changes, toolbar wrapping and PWA chrome settling.
// (Without this, a canvas sized while the stage was 0px stays 0px until a window
// resize, leaving the overlay + guides invisible.)
if ("ResizeObserver" in window) {
  const stageObserver = new ResizeObserver(() => sizeCanvases());
  stageObserver.observe(stageEl);
}
gridSelect.addEventListener("change", () => {
  setSetting("grid", gridSelect.value);
  redrawGuides();
});
perspectiveSelect.addEventListener("change", () => {
  setSetting("perspective", perspectiveSelect.value);
  redrawGuides();
});

// ---------- Image import ----------
importInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const url = URL.createObjectURL(file);
  try {
    await overlay.loadImageOverlay(url);
    syncOverlayControls();
    showToast("Image loaded. Drag, pinch and rotate to position it.");
  } catch {
    showToast("Could not load that image.");
  }
  importInput.value = "";
});

// ---------- Overlay controls ----------
function syncOverlayControls() {
  opacitySlider.value = Math.round(overlay.getCurrentOpacity() * 100);
  rotateSlider.value = Math.round(overlay.getCurrentRotation());
  // Keep the lock button in sync with the actual overlay state.
  const locked = overlay.isLocked();
  btnLock.setAttribute("aria-pressed", String(locked));
  btnLock.textContent = locked ? "🔓" : "🔒";
}

opacitySlider.addEventListener("input", () => {
  overlay.setOpacity(opacitySlider.value / 100);
});

rotateSlider.addEventListener("input", () => {
  overlay.setRotation(Number(rotateSlider.value));
});

btnMirrorH.addEventListener("click", () => overlay.mirrorHorizontal());
btnMirrorV.addEventListener("click", () => overlay.mirrorVertical());

btnLock.addEventListener("click", () => {
  const locked = overlay.toggleLock();
  btnLock.setAttribute("aria-pressed", String(locked));
  btnLock.textContent = locked ? "🔓" : "🔒";
});

btnReset.addEventListener("click", () => {
  overlay.resetOverlay();
  syncOverlayControls();
});

// ---------- Wake Lock ----------
btnWakelock.addEventListener("click", async () => {
  if (wakelock.isWakeLockActive()) {
    await wakelock.disableWakeLock();
    btnWakelock.setAttribute("aria-pressed", "false");
    setSetting("wakeLock", false);
  } else {
    const ok = await wakelock.enableWakeLock();
    if (!ok) {
      showToast("Wake Lock not supported on this browser.");
      return;
    }
    btnWakelock.setAttribute("aria-pressed", "true");
    setSetting("wakeLock", true);
  }
  document.getElementById("setting-wakelock").checked = wakelock.isWakeLockActive();
});

wakelock.reacquireOnVisible(() => getSetting("wakeLock", false));

// ---------- Camera zoom (crops out box walls at the edges) ----------
zoomSlider.addEventListener("input", () => {
  const zoom = Number(zoomSlider.value) / 100;
  setSetting("cameraZoom", zoom);
  applyVideoTransform();
});

// ---------- Paper frame mask (hides box edges / wall) ----------
function applyPaperFrame() {
  const on = getSetting("paperFrame", false);
  const inset = getSetting("frameInset", 8);
  paperMask.style.setProperty("--frame-inset", `${inset}%`);
  paperMask.classList.toggle("on", on);
  btnPaperFrame.setAttribute("aria-pressed", String(on));
}

btnPaperFrame.addEventListener("click", () => {
  setSetting("paperFrame", !getSetting("paperFrame", false));
  applyPaperFrame();
});

// ---------- Snapshot export ----------
// Draw a source (image/canvas) into ctx as object-fit: cover, so the export
// matches the on-screen crop. Skips zero-size sources instead of throwing.
function drawCover(ctx, source, sw, sh, dw, dh, zoom = 1, mirror = false) {
  if (!sw || !sh || !dw || !dh) return;
  const scale = Math.max(dw / sw, dh / sh) * zoom;
  const w = sw * scale;
  const h = sh * scale;
  ctx.save();
  ctx.translate(dw / 2, dh / 2);
  if (mirror) ctx.scale(-1, 1);
  ctx.drawImage(source, -w / 2, -h / 2, w, h);
  ctx.restore();
}

btnSnapshot.addEventListener("click", () => {
  try {
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = stageEl.clientWidth;
    exportCanvas.height = stageEl.clientHeight;
    if (!exportCanvas.width || !exportCanvas.height) {
      showToast("Nothing to export yet.");
      return;
    }
    const ctx = exportCanvas.getContext("2d");
    const dw = exportCanvas.width;
    const dh = exportCanvas.height;

    if (camera.isCameraActive() && videoEl.videoWidth) {
      const zoom = getSetting("cameraZoom", 1);
      // Match the live preview: object-fit cover + the same zoom & mirror.
      drawCover(ctx, videoEl, videoEl.videoWidth, videoEl.videoHeight, dw, dh, zoom, videoMirrored);
    } else {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, dw, dh);
    }

    const fabricCanvas = overlay.getCanvas();
    const lower = fabricCanvas && fabricCanvas.lowerCanvasEl;
    if (lower && lower.width && lower.height) {
      ctx.drawImage(lower, 0, 0, dw, dh);
    }
    if (guideCanvasEl.width && guideCanvasEl.height) {
      ctx.drawImage(guideCanvasEl, 0, 0, dw, dh);
    }

    exportCanvas.toBlob((blob) => {
      if (!blob) {
        showToast("Could not export the practice sheet.");
        return;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `wondersketch-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
    });
  } catch {
    showToast("Could not export the practice sheet.");
  }
});

// ---------- Drawer / panel system ----------
const drawers = document.querySelectorAll(".drawer");

function closeAllDrawers() {
  drawers.forEach((d) => d.classList.remove("open"));
  drawerBackdrop.classList.remove("open");
}

function openDrawer(name) {
  closeAllDrawers();
  const target = document.getElementById(`panel-${name}`);
  if (!target) return;
  target.classList.add("open");
  drawerBackdrop.classList.add("open");
}

document.querySelectorAll("[data-panel]").forEach((btn) => {
  if (btn.tagName !== "BUTTON" || !btn.closest(".topbar, .toolbar")) return;
  btn.addEventListener("click", () => openDrawer(btn.dataset.panel));
});

document.querySelectorAll("[data-close]").forEach((btn) => {
  btn.addEventListener("click", closeAllDrawers);
});
drawerBackdrop.addEventListener("click", closeAllDrawers);

btnCalligraphy.addEventListener("click", () => openDrawer("calligraphy"));

// ---------- Template library ----------
const templateCategoriesEl = document.getElementById("template-categories");
const templateDifficultiesEl = document.getElementById("template-difficulties");
const templateGridEl = document.getElementById("template-grid");
let activeCategory = "All";
let activeDifficulty = "All";

function renderCategoryTabs() {
  const cats = ["All", ...CATEGORIES];
  templateCategoriesEl.innerHTML = "";
  cats.forEach((cat) => {
    const btn = document.createElement("button");
    btn.className = "category-tab" + (cat === activeCategory ? " active" : "");
    btn.textContent = cat;
    btn.addEventListener("click", () => {
      activeCategory = cat;
      renderCategoryTabs();
      renderTemplateGrid();
    });
    templateCategoriesEl.appendChild(btn);
  });
}

function renderDifficultyTabs() {
  const levels = ["All", ...DIFFICULTIES];
  templateDifficultiesEl.innerHTML = "";
  levels.forEach((level) => {
    const btn = document.createElement("button");
    btn.className =
      "difficulty-tab lvl-" + level.toLowerCase() + (level === activeDifficulty ? " active" : "");
    btn.textContent = level;
    btn.addEventListener("click", () => {
      activeDifficulty = level;
      renderDifficultyTabs();
      renderTemplateGrid();
    });
    templateDifficultiesEl.appendChild(btn);
  });
}

async function renderTemplateGrid() {
  const templates = filterTemplates(activeCategory, activeDifficulty);
  // Fetch favorites once instead of one DB read per card.
  const favIds = new Set((await db.getFavorites()).map((f) => f.id));
  templateGridEl.innerHTML = "";
  if (templates.length === 0) {
    const empty = document.createElement("p");
    empty.className = "hint";
    empty.textContent = "No templates match this filter yet.";
    templateGridEl.appendChild(empty);
    return;
  }
  for (const tpl of templates) {
    const card = document.createElement("div");
    card.className = "template-card";

    const img = document.createElement("img");
    img.src = getTemplateUrl(tpl);
    img.alt = tpl.name;
    img.loading = "lazy";

    const name = document.createElement("span");
    name.className = "name";
    name.textContent = tpl.name;

    const badge = document.createElement("span");
    badge.className = "diff-badge lvl-" + (tpl.difficulty || "medium").toLowerCase();
    badge.textContent = tpl.difficulty || "";

    const favBtn = document.createElement("button");
    favBtn.className = "fav-toggle";
    favBtn.textContent = "★";
    if (favIds.has(tpl.id)) favBtn.classList.add("active");

    favBtn.addEventListener("click", async (e) => {
      e.stopPropagation();
      const nowFav = await db.toggleFavorite(tpl);
      favBtn.classList.toggle("active", nowFav);
    });

    card.appendChild(favBtn);
    card.appendChild(badge);
    card.appendChild(img);
    card.appendChild(name);

    card.addEventListener("click", async () => {
      try {
        await overlay.loadImageOverlay(getTemplateUrl(tpl));
        syncOverlayControls();
        closeAllDrawers();
        showToast(`${tpl.name} loaded as overlay`);
      } catch {
        showToast("Could not load template.");
      }
    });

    templateGridEl.appendChild(card);
  }
}

renderCategoryTabs();
renderDifficultyTabs();
renderTemplateGrid();

// ---------- Learn to Draw ----------
const learnListEl = document.getElementById("learn-list");
const learnDetailEl = document.getElementById("learn-detail");
const learnTitleEl = document.getElementById("learn-title");
const learnStepTextEl = document.getElementById("learn-step-text");
const learnStepCounterEl = document.getElementById("learn-step-counter");
const learnPrevBtn = document.getElementById("learn-prev");
const learnNextBtn = document.getElementById("learn-next");
const learnUseBtn = document.getElementById("learn-use");
const learnCompleteBtn = document.getElementById("learn-complete");
const learnBackBtn = document.getElementById("learn-back");

let currentLesson = null;
let currentStep = 0;

async function renderLearnList() {
  learnListEl.innerHTML = "";
  const completed = await db.getCompletedLessons();
  const completedIds = new Set(completed.map((c) => c.lessonId));

  LESSONS.forEach((lesson) => {
    const item = document.createElement("div");
    item.className = "lesson-item" + (completedIds.has(lesson.id) ? " done" : "");
    item.innerHTML = `<span>${lesson.title}</span><span>${completedIds.has(lesson.id) ? "✅" : `${lesson.steps.length} steps`}</span>`;
    item.addEventListener("click", () => openLesson(lesson));
    learnListEl.appendChild(item);
  });
}

function openLesson(lesson) {
  currentLesson = lesson;
  currentStep = 0;
  learnListEl.parentElement.querySelector("#learn-list").hidden = true;
  learnDetailEl.hidden = false;
  learnTitleEl.textContent = lesson.title;
  renderLearnStep();
}

function renderLearnStep() {
  learnStepTextEl.textContent = currentLesson.steps[currentStep];
  learnStepCounterEl.textContent = `Step ${currentStep + 1} of ${currentLesson.steps.length}`;
  learnPrevBtn.disabled = currentStep === 0;
  learnNextBtn.disabled = currentStep === currentLesson.steps.length - 1;
}

learnPrevBtn.addEventListener("click", () => {
  if (currentStep > 0) {
    currentStep--;
    renderLearnStep();
  }
});

learnNextBtn.addEventListener("click", () => {
  if (currentStep < currentLesson.steps.length - 1) {
    currentStep++;
    renderLearnStep();
  }
});

learnBackBtn.addEventListener("click", () => {
  learnDetailEl.hidden = true;
  learnListEl.hidden = false;
  currentLesson = null;
});

learnUseBtn.addEventListener("click", async () => {
  if (!currentLesson) return;
  const tpl = getTemplateById(currentLesson.templateId);
  if (!tpl) return;
  try {
    await overlay.loadImageOverlay(getTemplateUrl(tpl));
    syncOverlayControls();
    closeAllDrawers();
    showToast(`${tpl.name} loaded as overlay`);
  } catch {
    showToast("Could not load template.");
  }
});

learnCompleteBtn.addEventListener("click", async () => {
  if (!currentLesson) return;
  await db.markLessonComplete(currentLesson.id);
  showToast("Lesson marked complete!");
  renderLearnList();
});

renderLearnList();

// ---------- Daily Challenges ----------
const todayChallengeEl = document.getElementById("today-challenge");
const streakDisplayEl = document.getElementById("streak-display");
const challengeHistoryEl = document.getElementById("challenge-history");

async function renderChallenges() {
  const today = todayString();
  const challenge = getTodaysChallenge(today);
  const done = await db.isChallengeDone(today);
  const history = await db.getChallengeHistory(30);
  const streak = computeStreak(history, today);

  todayChallengeEl.innerHTML = `
    <h3>${challenge.template.name}</h3>
    <p>${challenge.prompt}</p>
    <button class="primary-btn" id="challenge-use" style="margin-top:10px;">Use as Overlay</button>
    <button class="primary-btn" id="challenge-done" style="margin-top:10px; background:${done ? "var(--accent-2)" : "#0b0a12"}; color:#0b0a12;">
      ${done ? "Completed ✓" : "Mark Today Complete"}
    </button>
  `;

  todayChallengeEl.querySelector("#challenge-use").addEventListener("click", async () => {
    try {
      await overlay.loadImageOverlay(getTemplateUrl(challenge.template));
      syncOverlayControls();
      closeAllDrawers();
      showToast(`${challenge.template.name} loaded as overlay`);
    } catch {
      showToast("Could not load template.");
    }
  });

  todayChallengeEl.querySelector("#challenge-done").addEventListener("click", async () => {
    await db.recordChallenge(today);
    renderChallenges();
    renderProgress();
  });

  streakDisplayEl.textContent = `🔥 ${streak} day${streak === 1 ? "" : "s"}`;

  challengeHistoryEl.innerHTML = "";
  history.forEach((h) => {
    const li = document.createElement("li");
    li.innerHTML = `<span>${h.date}</span><span>${h.completed ? "✅" : ""}</span>`;
    challengeHistoryEl.appendChild(li);
  });
}

renderChallenges();

// ---------- Progress ----------
async function renderProgress() {
  const completedLessons = await db.getCompletedLessons();
  const history = await db.getChallengeHistory(365);
  const favorites = await db.getFavorites();
  const streak = computeStreak(history, todayString());

  document.getElementById("stat-streak").textContent = streak;
  document.getElementById("stat-lessons").textContent = completedLessons.length;
  document.getElementById("stat-challenges").textContent = history.filter((h) => h.completed).length;
  document.getElementById("stat-favorites").textContent = favorites.length;

  const favGrid = document.getElementById("favorites-grid");
  favGrid.innerHTML = "";
  favorites.forEach((tpl) => {
    const card = document.createElement("div");
    card.className = "template-card";
    card.innerHTML = `<img src="${getTemplateUrl(tpl)}" alt="${tpl.name}" loading="lazy" /><span class="name">${tpl.name}</span>`;
    card.addEventListener("click", async () => {
      try {
        await overlay.loadImageOverlay(getTemplateUrl(tpl));
        syncOverlayControls();
        closeAllDrawers();
      } catch {
        showToast("Could not load template.");
      }
    });
    favGrid.appendChild(card);
  });
}

document.querySelector('[data-panel="progress"]').addEventListener("click", renderProgress);

// ---------- Settings ----------
const settingWakeLock = document.getElementById("setting-wakelock");
const settingMirrorFront = document.getElementById("setting-mirror-front");
const settingMirrorRear = document.getElementById("setting-mirror-rear");
const settingOrientationLock = document.getElementById("setting-orientation-lock");
const settingFrameSize = document.getElementById("setting-frame-size");
const btnClearData = document.getElementById("btn-clear-data");

settingWakeLock.checked = getSetting("wakeLock", false);
settingMirrorFront.checked = getSetting("mirrorFront", true);
settingMirrorRear.checked = getSetting("mirrorRear", false);
settingOrientationLock.checked = getSetting("orientationLock", false);
settingFrameSize.value = getSetting("frameInset", 8);

async function applyOrientationLock(enable) {
  try {
    if (enable && screen.orientation && screen.orientation.lock) {
      await screen.orientation.lock(screen.orientation.type);
      return true;
    }
    if (!enable && screen.orientation && screen.orientation.unlock) {
      screen.orientation.unlock();
    }
  } catch {
    showToast("Orientation lock needs the app installed / fullscreen.");
    return false;
  }
  return enable;
}

settingOrientationLock.addEventListener("change", async () => {
  const ok = await applyOrientationLock(settingOrientationLock.checked);
  settingOrientationLock.checked = ok;
  setSetting("orientationLock", ok);
});

settingFrameSize.addEventListener("input", () => {
  setSetting("frameInset", Number(settingFrameSize.value));
  applyPaperFrame();
});

settingWakeLock.addEventListener("change", async () => {
  if (settingWakeLock.checked) {
    const ok = await wakelock.enableWakeLock();
    settingWakeLock.checked = ok;
    setSetting("wakeLock", ok);
    btnWakelock.setAttribute("aria-pressed", String(ok));
  } else {
    await wakelock.disableWakeLock();
    setSetting("wakeLock", false);
    btnWakelock.setAttribute("aria-pressed", "false");
  }
});

settingMirrorFront.addEventListener("change", () => {
  setSetting("mirrorFront", settingMirrorFront.checked);
  applyVideoTransform();
});

settingMirrorRear.addEventListener("change", () => {
  setSetting("mirrorRear", settingMirrorRear.checked);
  applyVideoTransform();
});

btnClearData.addEventListener("click", async () => {
  if (!confirm("This will erase favorites, progress and settings stored on this device. Continue?")) return;
  await db.clearAllData();
  localStorage.clear();
  showToast("All local data cleared.");
  setTimeout(() => location.reload(), 1000);
});

// ---------- Calligraphy ----------
const calligraphyTextEl = document.getElementById("calligraphy-text");
const calligraphyFontEl = document.getElementById("calligraphy-font");
const calligraphySizeEl = document.getElementById("calligraphy-size");
const calligraphyApplyBtn = document.getElementById("calligraphy-apply");

calligraphyApplyBtn.addEventListener("click", async () => {
  const text = calligraphyTextEl.value || "WonderSketch";
  const font = calligraphyFontEl.value;
  const size = Number(calligraphySizeEl.value);
  const dataUrl = renderCalligraphyImage(text, font, size);
  try {
    await overlay.loadImageOverlay(dataUrl);
    syncOverlayControls();
    closeAllDrawers();
    showToast("Calligraphy overlay applied");
  } catch {
    showToast("Could not render text overlay.");
  }
});

// ---------- App version / update check ----------
const updateBanner = document.getElementById("update-banner");
const updateBannerText = document.getElementById("update-banner-text");
const btnRefreshUpdate = document.getElementById("btn-refresh-update");
const btnCheckUpdates = document.getElementById("btn-check-updates");
const appVersionEl = document.getElementById("app-version");

appVersionEl.textContent = APP_VERSION;

async function checkForUpdate({ manual = false } = {}) {
  let latest;
  try {
    latest = await fetchLatestVersion();
  } catch {
    if (manual) showToast("Couldn't check for updates. Are you online?");
    return;
  }
  if (isUpdateAvailable(APP_VERSION, latest)) {
    updateBannerText.textContent = `New version ${latest} available — tap Refresh to update.`;
    updateBanner.hidden = false;
  } else {
    updateBanner.hidden = true;
    if (manual) showToast(`You're up to date (v${APP_VERSION}).`);
  }
}

btnRefreshUpdate.addEventListener("click", async () => {
  btnRefreshUpdate.disabled = true;
  updateBannerText.textContent = "Updating…";
  await forceRefresh();
});

btnCheckUpdates.addEventListener("click", () => checkForUpdate({ manual: true }));

// ---------- Init ----------
function restoreGuideSettings() {
  gridSelect.value = getSetting("grid", "none");
  perspectiveSelect.value = getSetting("perspective", "none");
  zoomSlider.value = Math.round(getSetting("cameraZoom", 1) * 100);
  applyPaperFrame();
}

async function init() {
  restoreGuideSettings();
  sizeCanvases();
  // Re-size after first paint in case the stage had no layout size yet at init
  // (cold PWA launch) — otherwise the guide canvas can stay 0px until a resize.
  requestAnimationFrame(sizeCanvases);

  if (getSetting("orientationLock", false)) {
    applyOrientationLock(true);
  }

  if (getSetting("wakeLock", false)) {
    const ok = await wakelock.enableWakeLock();
    btnWakelock.setAttribute("aria-pressed", String(ok));
  }

  await tryStartCamera();

  if ("serviceWorker" in navigator) {
    try {
      await navigator.serviceWorker.register("service-worker.js");
    } catch {
      /* offline support unavailable */
    }
  }

  checkForUpdate();
}

init();
