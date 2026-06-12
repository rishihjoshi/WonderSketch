export function renderCalligraphyImage(text, fontFamily, fontSize) {
  const lines = text.split("\n").filter((l) => l.length > 0);
  if (lines.length === 0) lines.push(" ");

  const measureCanvas = document.createElement("canvas");
  const measureCtx = measureCanvas.getContext("2d");
  measureCtx.font = `${fontSize}px ${fontFamily}`;

  const lineHeight = fontSize * 1.3;
  let maxWidth = 0;
  lines.forEach((line) => {
    const w = measureCtx.measureText(line).width;
    if (w > maxWidth) maxWidth = w;
  });

  const padding = fontSize * 0.5;
  const width = Math.ceil(maxWidth + padding * 2);
  const height = Math.ceil(lines.length * lineHeight + padding * 2);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  ctx.font = `${fontSize}px ${fontFamily}`;
  ctx.fillStyle = "#000000";
  ctx.textBaseline = "top";

  lines.forEach((line, i) => {
    ctx.fillText(line, padding, padding + i * lineHeight);
  });

  return canvas.toDataURL("image/png");
}
