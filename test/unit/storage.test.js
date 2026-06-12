import { describe, it, expect, beforeEach } from "vitest";
import { getSetting, setSetting, removeSetting, clearAllSettings, todayString } from "../../js/storage.js";

beforeEach(() => {
  localStorage.clear();
});

describe("storage", () => {
  it("returns fallback when key is missing", () => {
    expect(getSetting("missing", "default")).toBe("default");
  });

  it("stores and retrieves values as JSON", () => {
    setSetting("grid", "6x6");
    expect(getSetting("grid")).toBe("6x6");

    setSetting("wakeLock", true);
    expect(getSetting("wakeLock")).toBe(true);
  });

  it("namespaces keys with the wondersketch: prefix", () => {
    setSetting("grid", "3x3");
    expect(localStorage.getItem("wondersketch:grid")).toBe('"3x3"');
  });

  it("removes a single setting", () => {
    setSetting("grid", "4x4");
    removeSetting("grid");
    expect(getSetting("grid", "none")).toBe("none");
  });

  it("clears only wondersketch-prefixed settings", () => {
    setSetting("grid", "4x4");
    localStorage.setItem("other-app:setting", "keep-me");

    clearAllSettings();

    expect(getSetting("grid", "none")).toBe("none");
    expect(localStorage.getItem("other-app:setting")).toBe("keep-me");
  });

  it("returns fallback for corrupted JSON instead of throwing", () => {
    localStorage.setItem("wondersketch:broken", "{not json");
    expect(getSetting("broken", "fallback")).toBe("fallback");
  });

  it("formats today as YYYY-MM-DD", () => {
    const d = new Date();
    const expected = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    expect(todayString()).toBe(expected);
  });
});
