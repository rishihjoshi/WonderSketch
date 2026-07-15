import { describe, it, expect } from "vitest";
import { APP_VERSION, isUpdateAvailable } from "../../js/version.js";

describe("version", () => {
  it("exposes a non-empty app version string", () => {
    expect(typeof APP_VERSION).toBe("string");
    expect(APP_VERSION.length).toBeGreaterThan(0);
  });

  it("flags an update when the latest version differs", () => {
    expect(isUpdateAvailable("1.0.1", "1.0.2")).toBe(true);
    expect(isUpdateAvailable("1.0.1", "2.0.0")).toBe(true);
  });

  it("does not flag an update when versions match", () => {
    expect(isUpdateAvailable("1.0.1", "1.0.1")).toBe(false);
  });

  it("does not flag an update for missing or invalid latest values", () => {
    expect(isUpdateAvailable("1.0.1", null)).toBe(false);
    expect(isUpdateAvailable("1.0.1", "")).toBe(false);
    expect(isUpdateAvailable("1.0.1", undefined)).toBe(false);
  });
});
