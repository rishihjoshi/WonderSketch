let currentStream = null;
let facingMode = "environment";

export function getFacingMode() {
  return facingMode;
}

export async function startCamera(videoEl) {
  stopCamera();
  const constraints = {
    video: {
      facingMode,
      width: { ideal: 1920 },
      height: { ideal: 1080 },
    },
    audio: false,
  };
  const stream = await navigator.mediaDevices.getUserMedia(constraints);
  currentStream = stream;
  videoEl.srcObject = stream;
  await videoEl.play();
  return stream;
}

export function stopCamera() {
  if (currentStream) {
    currentStream.getTracks().forEach((track) => track.stop());
    currentStream = null;
  }
}

export async function switchCamera(videoEl) {
  facingMode = facingMode === "environment" ? "user" : "environment";
  return startCamera(videoEl);
}

export function isCameraActive() {
  return !!currentStream;
}

export function isCameraSupported() {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}
