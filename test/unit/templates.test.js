import { describe, it, expect } from "vitest";
import { CATEGORIES, TEMPLATES, getTemplateUrl, getTemplatesByCategory, getTemplateById } from "../../js/templates.js";

describe("templates", () => {
  it("every template belongs to a known category", () => {
    TEMPLATES.forEach((t) => {
      expect(CATEGORIES).toContain(t.category);
    });
  });

  it("every template has a unique id", () => {
    const ids = TEMPLATES.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("builds a relative asset URL from the file name", () => {
    const template = TEMPLATES[0];
    expect(getTemplateUrl(template)).toBe(`assets/templates/${template.file}`);
  });

  it("filters templates by category", () => {
    const flowers = getTemplatesByCategory("Flowers");
    expect(flowers.length).toBeGreaterThan(0);
    flowers.forEach((t) => expect(t.category).toBe("Flowers"));
  });

  it("returns all templates for 'All' or empty category", () => {
    expect(getTemplatesByCategory("All")).toEqual(TEMPLATES);
    expect(getTemplatesByCategory(undefined)).toEqual(TEMPLATES);
  });

  it("looks up a template by id", () => {
    const found = getTemplateById("animal-cat");
    expect(found).toBeDefined();
    expect(found.name).toBe("Cat");
  });

  it("returns undefined for an unknown id", () => {
    expect(getTemplateById("does-not-exist")).toBeUndefined();
  });
});
