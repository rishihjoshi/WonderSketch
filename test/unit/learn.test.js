import { describe, it, expect } from "vitest";
import { LESSONS } from "../../js/learn.js";
import { getTemplateById } from "../../js/templates.js";

describe("learn lessons", () => {
  it("has a non-empty lesson list", () => {
    expect(LESSONS.length).toBeGreaterThan(0);
  });

  it("every lesson has at least one step", () => {
    LESSONS.forEach((lesson) => {
      expect(Array.isArray(lesson.steps)).toBe(true);
      expect(lesson.steps.length).toBeGreaterThan(0);
    });
  });

  it("every lesson references a valid template", () => {
    LESSONS.forEach((lesson) => {
      expect(getTemplateById(lesson.templateId)).toBeDefined();
    });
  });

  it("every lesson has a unique id", () => {
    const ids = LESSONS.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
