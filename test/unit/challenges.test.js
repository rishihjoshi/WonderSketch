import { describe, it, expect } from "vitest";
import { getTodaysChallenge, computeStreak } from "../../js/challenges.js";
import { TEMPLATES } from "../../js/templates.js";

describe("getTodaysChallenge", () => {
  it("is deterministic for a given date", () => {
    const a = getTodaysChallenge("2026-06-12");
    const b = getTodaysChallenge("2026-06-12");
    expect(a).toEqual(b);
  });

  it("returns a valid template and prompt", () => {
    const challenge = getTodaysChallenge("2026-06-12");
    expect(TEMPLATES).toContain(challenge.template);
    expect(typeof challenge.prompt).toBe("string");
    expect(challenge.date).toBe("2026-06-12");
  });

  it("varies across different dates", () => {
    const dates = ["2026-01-01", "2026-02-15", "2026-07-04", "2026-12-25"];
    const ids = new Set(dates.map((d) => getTodaysChallenge(d).template.id));
    expect(ids.size).toBeGreaterThan(1);
  });
});

describe("computeStreak", () => {
  it("returns 0 with no history", () => {
    expect(computeStreak([], "2026-06-12")).toBe(0);
  });

  it("counts a single day completed today", () => {
    const history = [{ date: "2026-06-12", completed: true }];
    expect(computeStreak(history, "2026-06-12")).toBe(1);
  });

  it("counts consecutive days ending today", () => {
    const history = [
      { date: "2026-06-10", completed: true },
      { date: "2026-06-11", completed: true },
      { date: "2026-06-12", completed: true },
    ];
    expect(computeStreak(history, "2026-06-12")).toBe(3);
  });

  it("stops counting at a gap", () => {
    const history = [
      { date: "2026-06-09", completed: true },
      { date: "2026-06-11", completed: true },
      { date: "2026-06-12", completed: true },
    ];
    expect(computeStreak(history, "2026-06-12")).toBe(2);
  });

  it("ignores incomplete entries", () => {
    const history = [
      { date: "2026-06-11", completed: false },
      { date: "2026-06-12", completed: true },
    ];
    expect(computeStreak(history, "2026-06-12")).toBe(1);
  });

  it("handles month boundaries without timezone drift", () => {
    const history = [
      { date: "2026-05-31", completed: true },
      { date: "2026-06-01", completed: true },
    ];
    expect(computeStreak(history, "2026-06-01")).toBe(2);
  });

  it("handles year boundaries without timezone drift", () => {
    const history = [
      { date: "2025-12-31", completed: true },
      { date: "2026-01-01", completed: true },
    ];
    expect(computeStreak(history, "2026-01-01")).toBe(2);
  });
});
