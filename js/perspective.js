const LINE_COLOR = "rgba(52, 214, 196, 0.5)";
const VP_COLOR = "rgba(255, 209, 102, 0.9)";

function ray(ctx, fromX, fromY, toX, toY) {
  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, toY);
  ctx.stroke();
}

function drawVP(ctx, x, y) {
  ctx.save();
  ctx.fillStyle = VP_COLOR;
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function raysToEdges(ctx, fromX, fromY, width, height, count = 12) {
  // Cast rays from a point toward many points around the canvas border.
  const points = [];
  const steps = count;
  for (let i = 0; i <= steps; i++) {
    points.push([(width / steps) * i, 0]);
    points.push([(width / steps) * i, height]);
  }
  for (let i = 0; i <= steps; i++) {
    points.push([0, (height / steps) * i]);
    points.push([width, (height / steps) * i]);
  }
  points.forEach(([x, y]) => ray(ctx, fromX, fromY, x, y));
}

function onePoint(ctx, width, height) {
  const cx = width / 2;
  const cy = height / 2;
  raysToEdges(ctx, cx, cy, width, height, 10);
  drawVP(ctx, cx, cy);
}

function twoPoint(ctx, width, height) {
  const horizon = height / 2;
  const vp1x = width * 0.05;
  const vp2x = width * 0.95;

  ctx.beginPath();
  ctx.moveTo(0, horizon);
  ctx.lineTo(width, horizon);
  ctx.stroke();

  raysToEdges(ctx, vp1x, horizon, width, height, 8);
  raysToEdges(ctx, vp2x, horizon, width, height, 8);

  drawVP(ctx, vp1x, horizon);
  drawVP(ctx, vp2x, horizon);
}

function threePoint(ctx, width, height) {
  const horizon = height * 0.35;
  const vp1x = width * 0.05;
  const vp2x = width * 0.95;
  const vp3x = width / 2;
  const vp3y = height * 1.3;

  ctx.beginPath();
  ctx.moveTo(0, horizon);
  ctx.lineTo(width, horizon);
  ctx.stroke();

  raysToEdges(ctx, vp1x, horizon, width, height, 8);
  raysToEdges(ctx, vp2x, horizon, width, height, 8);
  raysToEdges(ctx, vp3x, vp3y, width, height, 8);

  drawVP(ctx, vp1x, horizon);
  drawVP(ctx, vp2x, horizon);
}

function isometric(ctx, width, height) {
  const step = 40;
  const diagonals = Math.ceil((width + height) / step) + 2;

  // Lines at +30deg
  for (let i = -diagonals; i < diagonals; i++) {
    const offset = i * step;
    ray(ctx, 0, offset, width, offset + width * Math.tan(Math.PI / 6));
  }
  // Lines at -30deg
  for (let i = -diagonals; i < diagonals; i++) {
    const offset = i * step;
    ray(ctx, 0, height - offset, width, height - offset - width * Math.tan(Math.PI / 6));
  }
  // Vertical lines
  for (let x = 0; x <= width; x += step) {
    ray(ctx, x, 0, x, height);
  }
}

export function drawPerspective(ctx, width, height, type) {
  if (type === "none" || !type) return;

  ctx.save();
  ctx.strokeStyle = LINE_COLOR;
  ctx.lineWidth = 1;

  switch (type) {
    case "1pt":
      onePoint(ctx, width, height);
      break;
    case "2pt":
      twoPoint(ctx, width, height);
      break;
    case "3pt":
      threePoint(ctx, width, height);
      break;
    case "iso":
      isometric(ctx, width, height);
      break;
  }

  ctx.restore();
}
