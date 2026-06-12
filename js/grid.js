const LINE_COLOR = "rgba(124, 92, 255, 0.55)";

export function drawGrid(ctx, width, height, type) {
  if (type === "none" || !type) return;

  const divisions = { "3x3": 3, "4x4": 4, "6x6": 6 }[type];
  if (!divisions) return;

  ctx.save();
  ctx.strokeStyle = LINE_COLOR;
  ctx.lineWidth = 1.5;
  ctx.setLineDash([6, 6]);

  for (let i = 1; i < divisions; i++) {
    const x = (width / divisions) * i;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();

    const y = (height / divisions) * i;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  ctx.restore();
}
