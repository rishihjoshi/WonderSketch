/* global fabric */

let canvas = null;
let activeImage = null;
let defaultState = null;
let stageElRef = null;
// Remember the last opacity the user chose so new templates keep it (tracing
// works best at a faint, consistent opacity — don't reset it every load).
let lastOpacity = 0.6;

export function initOverlayCanvas(canvasEl, stageEl) {
  stageElRef = stageEl;
  canvas = new fabric.Canvas(canvasEl, {
    backgroundColor: "transparent",
    preserveObjectStacking: true,
  });
  resizeCanvas(stageEl);
  window.addEventListener("resize", () => resizeCanvas(stageEl));
  return canvas;
}

export function resizeCanvas(stageEl) {
  if (!canvas) return;
  if (stageEl) stageElRef = stageEl;
  const el = stageEl || stageElRef;
  if (!el) return;
  canvas.setWidth(el.clientWidth);
  canvas.setHeight(el.clientHeight);
  canvas.renderAll();
}

// Usable canvas dimensions, falling back to the stage/window if the fabric
// canvas hasn't been sized yet (avoids scaling a freshly loaded image to 0).
function canvasDims() {
  let w = canvas.getWidth();
  let h = canvas.getHeight();
  if (!w || !h) {
    if (stageElRef && stageElRef.clientWidth) {
      resizeCanvas(stageElRef);
      w = canvas.getWidth();
      h = canvas.getHeight();
    }
  }
  return {
    w: w || (stageElRef && stageElRef.clientWidth) || window.innerWidth || 800,
    h: h || (stageElRef && stageElRef.clientHeight) || window.innerHeight || 600,
  };
}

export function loadImageOverlay(url) {
  return new Promise((resolve, reject) => {
    // Guard against a load that never fires the callback (bad/blocked URL).
    let settled = false;
    const timeout = setTimeout(() => {
      if (!settled) {
        settled = true;
        reject(new Error("Image load timed out"));
      }
    }, 10000);

    fabric.Image.fromURL(
      url,
      (img) => {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        if (!img || !img.width) {
          reject(new Error("Failed to load image"));
          return;
        }
        if (activeImage) {
          canvas.remove(activeImage);
        }
        const { w, h } = canvasDims();
        const maxDim = Math.min(w, h) * 0.8;
        const scale = Math.min(maxDim / img.width, maxDim / img.height, 1.5);

        img.set({
          left: w / 2,
          top: h / 2,
          originX: "center",
          originY: "center",
          opacity: lastOpacity,
          scaleX: scale,
          scaleY: scale,
          angle: 0,
          flipX: false,
          flipY: false,
          // A freshly loaded image is always movable — clear any prior lock.
          lockMovementX: false,
          lockMovementY: false,
          lockRotation: false,
          lockScalingX: false,
          lockScalingY: false,
          hasControls: true,
          selectable: true,
        });

        canvas.add(img);
        canvas.setActiveObject(img);
        activeImage = img;
        defaultState = {
          left: img.left,
          top: img.top,
          scaleX: img.scaleX,
          scaleY: img.scaleY,
          angle: 0,
          flipX: false,
          flipY: false,
          opacity: img.opacity,
        };
        canvas.renderAll();
        resolve(img);
      }
    );
  });
}

export function setOpacity(value) {
  lastOpacity = value;
  if (!activeImage) return;
  activeImage.set("opacity", value);
  canvas.renderAll();
}

export function setRotation(degrees) {
  if (!activeImage) return;
  activeImage.set("angle", degrees);
  canvas.renderAll();
}

export function mirrorHorizontal() {
  if (!activeImage) return;
  activeImage.set("flipX", !activeImage.flipX);
  canvas.renderAll();
}

export function mirrorVertical() {
  if (!activeImage) return;
  activeImage.set("flipY", !activeImage.flipY);
  canvas.renderAll();
}

export function toggleLock() {
  if (!activeImage) return false;
  const locked = !activeImage.lockMovementX;
  activeImage.set({
    lockMovementX: locked,
    lockMovementY: locked,
    lockRotation: locked,
    lockScalingX: locked,
    lockScalingY: locked,
    hasControls: !locked,
    selectable: !locked,
  });
  canvas.discardActiveObject();
  if (!locked) canvas.setActiveObject(activeImage);
  canvas.renderAll();
  return locked;
}

export function resetOverlay() {
  if (!activeImage || !defaultState) return;
  activeImage.set(defaultState);
  canvas.setActiveObject(activeImage);
  canvas.renderAll();
}

export function clearOverlay() {
  if (activeImage) {
    canvas.remove(activeImage);
    activeImage = null;
    defaultState = null;
    canvas.renderAll();
  }
}

export function getCanvas() {
  return canvas;
}

export function hasActiveImage() {
  return !!activeImage;
}

export function getCurrentRotation() {
  return activeImage ? activeImage.angle : 0;
}

export function getCurrentOpacity() {
  return activeImage ? activeImage.opacity : lastOpacity;
}

export function isLocked() {
  return !!(activeImage && activeImage.lockMovementX);
}
