import * as camera from "./camera.js";
import * as overlay from "./overlay.js";
import { drawGrid } from "./grid.js";
import { drawPerspective } from "./perspective.js";
import { renderCalligraphyImage } from "./calligraphy.js";
import { CATEGORIES, getTemplatesByCategory, getTemplateUrl, getTemplateById } from "./templates.js";
import { LESSONS, getLessonById } from "./learn.js";
import { getTodaysChallenge, computeStreak } from "./challenges.js";
import { getSetting, setSetting, todayString } from "./storage.js";
import * as wakelock from "./wakelock.js";
import * as db from "./db.js";

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

function applyMirrorSetting() {
  const mirrorFront = getSetting("mirrorFront", true);
  const shouldMirror = camera.getFacingMode() === "user" && mirrorFront;
  videoEl.style.transform = shouldMirror ? "scaleX(-1)" : "none";
}

// ---------- Overlay canvas (Fabric) ----------
overlay.initOverlayCanvas(overlayCanvasEl, stageEl);

// ---------- Guide canvas (grid + perspective) ----------
const guideCtx = guideCanvasEl.getContext("2d");

function resizeGuideCanvas() {
  guideCanvasEl.width = stageEl.clientWidth;
  guideCanvasEl.height = stageEl.clientHeight;
  redrawGuides();
}

function redrawGuides() {
  const w = guideCanvasEl.width;
  const h = guideCanvasEl.height;
  guideCtx.clearRect(0, 0, w, h);
  drawGrid(guideCtx, w, h, gridSelect.value);
  drawPerspective(guideCtx, w, h, perspectiveSelect.value);
}

window.addEventListener("resize", resizeGuideCanvas);
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

// ---------- Snapshot export ----------
btnSnapshot.addEventListener("click", () => {
  const exportCanvas = document.createElement("canvas");
  exportCanvas.width = stageEl.clientWidth;
  exportCanvas.height = stageEl.clientHeight;
  const ctx = exportCanvas.getContext("2d");

  if (camera.isCameraActive() && videoEl.videoWidth) {
    ctx.save();
    if (videoEl.style.transform === "scaleX(-1)") {
      ctx.translate(exportCanvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(videoEl, 0, 0, exportCanvas.width, exportCanvas.height);
    ctx.restore();
  } else {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
  }

  const fabricCanvas = overlay.getCanvas();
  if (fabricCanvas) {
    ctx.drawImage(fabricCanvas.lowerCanvasEl, 0, 0, exportCanvas.width, exportCanvas.height);
  }
  ctx.drawImage(guideCanvasEl, 0, 0, exportCanvas.width, exportCanvas.height);

  exportCanvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `wondersketch-${Date.now()}.png`;
    a.click();
    URL.revokeObjectURL(url);
  });
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
const templateGridEl = document.getElementById("template-grid");
let activeCategory = "All";

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

async function renderTemplateGrid() {
  const templates = getTemplatesByCategory(activeCategory);
  templateGridEl.innerHTML = "";
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

    const favBtn = document.createElement("button");
    favBtn.className = "fav-toggle";
    favBtn.textContent = "★";
    const fav = await db.isFavorite(tpl.id);
    if (fav) favBtn.classList.add("active");

    favBtn.addEventListener("click", async (e) => {
      e.stopPropagation();
      const nowFav = await db.toggleFavorite(tpl);
      favBtn.classList.toggle("active", nowFav);
    });

    card.appendChild(favBtn);
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
const btnClearData = document.getElementById("btn-clear-data");

settingWakeLock.checked = getSetting("wakeLock", false);
settingMirrorFront.checked = getSetting("mirrorFront", true);

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
  applyMirrorSetting();
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

// ---------- Init ----------
function restoreGuideSettings() {
  gridSelect.value = getSetting("grid", "none");
  perspectiveSelect.value = getSetting("perspective", "none");
}

async function init() {
  restoreGuideSettings();
  resizeGuideCanvas();
  overlay.resizeCanvas(stageEl);

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
}

init();
