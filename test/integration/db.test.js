import { describe, it, expect, beforeEach, beforeAll } from "vitest";
import "fake-indexeddb/auto";
import Dexie from "dexie";

let db;

beforeAll(async () => {
  globalThis.Dexie = Dexie;
  db = await import("../../js/db.js");
});

beforeEach(async () => {
  await db.clearAllData();
  // db.delete() closes the connection; reopen by accessing a table to trigger re-open.
  await db.default.open();
});

describe("favorites", () => {
  it("toggles a template in and out of favorites", async () => {
    const template = { id: "animal-cat", category: "Animals", name: "Cat" };

    expect(await db.isFavorite(template.id)).toBe(false);

    const added = await db.toggleFavorite(template);
    expect(added).toBe(true);
    expect(await db.isFavorite(template.id)).toBe(true);
    expect(await db.getFavorites()).toEqual([template]);

    const removed = await db.toggleFavorite(template);
    expect(removed).toBe(false);
    expect(await db.isFavorite(template.id)).toBe(false);
    expect(await db.getFavorites()).toEqual([]);
  });
});

describe("lesson progress", () => {
  it("marks and queries lesson completion", async () => {
    expect(await db.isLessonComplete("basics-shapes")).toBe(false);

    await db.markLessonComplete("basics-shapes");

    expect(await db.isLessonComplete("basics-shapes")).toBe(true);
    const completed = await db.getCompletedLessons();
    expect(completed.map((c) => c.lessonId)).toContain("basics-shapes");
  });
});

describe("challenges", () => {
  it("records a challenge and reports it done", async () => {
    expect(await db.isChallengeDone("2026-06-12")).toBe(false);

    await db.recordChallenge("2026-06-12");

    expect(await db.isChallengeDone("2026-06-12")).toBe(true);
  });

  it("returns history sorted newest-first and capped to the limit", async () => {
    await db.recordChallenge("2026-06-10");
    await db.recordChallenge("2026-06-11");
    await db.recordChallenge("2026-06-12");

    const history = await db.getChallengeHistory(2);

    expect(history.map((h) => h.date)).toEqual(["2026-06-12", "2026-06-11"]);
  });
});

describe("custom images", () => {
  it("saves and retrieves a custom image", async () => {
    const blob = new Blob(["fake"], { type: "image/png" });

    await db.saveCustomImage(blob, "my-drawing.png");

    const images = await db.getCustomImages();
    expect(images).toHaveLength(1);
    expect(images[0].name).toBe("my-drawing.png");
  });
});

describe("clearAllData", () => {
  it("removes all stored data", async () => {
    await db.toggleFavorite({ id: "animal-cat", category: "Animals", name: "Cat" });
    await db.markLessonComplete("basics-shapes");
    await db.recordChallenge("2026-06-12");

    await db.clearAllData();
    await db.default.open();

    expect(await db.getFavorites()).toEqual([]);
    expect(await db.getCompletedLessons()).toEqual([]);
    expect(await db.getChallengeHistory()).toEqual([]);
  });
});
