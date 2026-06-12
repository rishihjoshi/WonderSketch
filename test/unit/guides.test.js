import { describe, it, expect, vi } from "vitest";
import { drawGrid } from "../../js/grid.js";
import { drawPerspective } from "../../js/perspective.js";

function createMockCtx() {
  return {
    save: vi.fn(),
    restore: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    setLineDash: vi.fn(),
    strokeStyle: "",
    fillStyle: "",
    lineWidth: 0,
  };
}

describe("drawGrid", () => {
  it("draws nothing for 'none' or missing type", () => {
    const ctx = createMockCtx();
    drawGrid(ctx, 800, 600, "none");
    drawGrid(ctx, 800, 600, undefined);
    expect(ctx.stroke).not.toHaveBeenCalled();
  });

  it("draws nothing for an unknown type", () => {
    const ctx = createMockCtx();
    drawGrid(ctx, 800, 600, "9x9");
    expect(ctx.stroke).not.toHaveBeenCalled();
  });

  it("draws (divisions-1) vertical + horizontal line pairs for 3x3", () => {
    const ctx = createMockCtx();
    drawGrid(ctx, 800, 600, "3x3");
    // 2 internal divisions, each draws a vertical and horizontal line (2 strokes each)
    expect(ctx.stroke).toHaveBeenCalledTimes(4);
    expect(ctx.save).toHaveBeenCalled();
    expect(ctx.restore).toHaveBeenCalled();
  });

  it("draws more lines for 6x6 than 3x3", () => {
    const ctx3 = createMockCtx();
    const ctx6 = createMockCtx();
    drawGrid(ctx3, 800, 600, "3x3");
    drawGrid(ctx6, 800, 600, "6x6");
    expect(ctx6.stroke.mock.calls.length).toBeGreaterThan(ctx3.stroke.mock.calls.length);
  });
});

describe("drawPerspective", () => {
  it("draws nothing for 'none' or missing type", () => {
    const ctx = createMockCtx();
    drawPerspective(ctx, 800, 600, "none");
    drawPerspective(ctx, 800, 600, undefined);
    expect(ctx.stroke).not.toHaveBeenCalled();
    expect(ctx.fill).not.toHaveBeenCalled();
  });

  it("draws rays and a vanishing point marker for 1pt", () => {
    const ctx = createMockCtx();
    drawPerspective(ctx, 800, 600, "1pt");
    expect(ctx.stroke).toHaveBeenCalled();
    expect(ctx.arc).toHaveBeenCalledTimes(1);
    expect(ctx.fill).toHaveBeenCalledTimes(1);
  });

  it("draws two vanishing points for 2pt", () => {
    const ctx = createMockCtx();
    drawPerspective(ctx, 800, 600, "2pt");
    expect(ctx.arc).toHaveBeenCalledTimes(2);
  });

  it("draws an isometric grid without vanishing points", () => {
    const ctx = createMockCtx();
    drawPerspective(ctx, 800, 600, "iso");
    expect(ctx.stroke).toHaveBeenCalled();
    expect(ctx.arc).not.toHaveBeenCalled();
  });

  it("ignores unknown perspective types", () => {
    const ctx = createMockCtx();
    drawPerspective(ctx, 800, 600, "5pt");
    expect(ctx.stroke).not.toHaveBeenCalled();
  });
});
