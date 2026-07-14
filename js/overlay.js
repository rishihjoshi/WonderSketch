/* global fabric */

let canvas = null;
let activeImage = null;
let defaultState = null;

export function initOverlayCanvas(canvasEl, stageEl) {
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
  const { clientWidth, clientHeight } = stageEl;
  canvas.setWidth(clientWidth);
  canvas.setHeight(clientHeight);
  canvas.renderAll();
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
        const maxDim = Math.min(canvas.getWidth(), canvas.getHeight()) * 0.8;
        const scale = Math.min(maxDim / img.width, maxDim / img.height, 1.5);

        img.set({
          left: canvas.getWidth() / 2,
          top: canvas.getHeight() / 2,
          originX: "center",
          originY: "center",
          opacity: 0.6,
          scaleX: scale,
          scaleY: scale,
          angle: 0,
          flipX: false,
          flipY: false,
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
  return activeImage ? activeImage.opacity : 0.6;
}
