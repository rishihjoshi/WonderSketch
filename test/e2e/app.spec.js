import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/index.html");
});

test("loads the app shell with no console errors", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));

  await expect(page).toHaveTitle("WonderSketch AR");
  await expect(page.locator(".camera-placeholder")).toBeVisible();
  expect(errors).toEqual([]);
});

test("opens the template library and loads a template as an overlay", async ({ page }) => {
  await page.getByRole("button", { name: "Templates" }).click();
  await expect(page.locator("aside.drawer.open h2")).toHaveText("Template Library");

  await expect(page.locator(".template-card")).toHaveCount(29);

  await page.getByRole("button", { name: "Animals" }).click();
  const animalCards = page.locator(".template-card");
  await expect(animalCards).toHaveCount(2);

  await animalCards.first().click();
  await expect(page.locator("#stage-toast")).toBeVisible();
  await expect(page.locator("aside.drawer.open")).toHaveCount(0);
});

test("grid and perspective guide selectors render onto the guide canvas", async ({ page }) => {
  await page.locator("#grid-select").selectOption("6x6");
  await page.locator("#perspective-select").selectOption("2pt");

  const hasContent = await page.evaluate(() => {
    const canvas = document.getElementById("guide-canvas");
    const ctx = canvas.getContext("2d");
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] !== 0) return true;
    }
    return false;
  });

  expect(hasContent).toBe(true);
});

test("learn to draw lists lessons and shows step detail", async ({ page }) => {
  await page.getByRole("button", { name: "Learn to draw" }).click();
  await expect(page.locator("aside.drawer.open h2")).toHaveText("Learn to Draw");

  const lessons = page.locator(".lesson-item");
  await expect(lessons).toHaveCount(6);

  await lessons.first().click();
  await expect(page.locator("aside.drawer.open")).toContainText("Step 1 of");

  await page.getByRole("button", { name: "Next" }).click();
  await expect(page.locator("aside.drawer.open")).toContainText("Step 2 of");
});

test("daily challenge can be marked complete and updates the streak", async ({ page }) => {
  await page.getByRole("button", { name: "Daily challenges" }).click();
  await expect(page.locator("aside.drawer.open h2")).toHaveText("Daily Challenges");

  await expect(page.locator("#streak-display")).toHaveText("🔥 0 days");

  await page.getByRole("button", { name: "Mark Today Complete" }).click();

  await expect(page.getByRole("button", { name: "Completed" })).toBeVisible();
  await expect(page.locator("#streak-display")).toHaveText("🔥 1 day");
  await expect(page.locator("#challenge-history li")).toHaveCount(1);
});

test("calligraphy panel applies custom text as an overlay", async ({ page }) => {
  await page.locator("#btn-calligraphy").click();
  await expect(page.locator("aside.drawer.open h2")).toHaveText("Calligraphy Tracing");

  await page.locator("#calligraphy-text").fill("Hello AR");
  await page.getByRole("button", { name: "Apply to Canvas" }).click();

  await expect(page.locator("#stage-toast")).toHaveText("Calligraphy overlay applied");
  await expect(page.locator("aside.drawer.open")).toHaveCount(0);
});

test("snapshot export triggers a PNG download", async ({ page }) => {
  const downloadPromise = page.waitForEvent("download");
  await page.locator("#btn-snapshot").click();
  const download = await downloadPromise;

  expect(download.suggestedFilename()).toMatch(/^wondersketch-\d+\.png$/);
});

test("progress panel reflects completed lessons and challenges", async ({ page }) => {
  // Complete a lesson
  await page.getByRole("button", { name: "Learn to draw" }).click();
  await page.locator(".lesson-item").first().click();
  await page.getByRole("button", { name: "Mark Lesson Complete" }).click();
  await page.locator("aside.drawer.open .close-btn").click();

  // Complete today's challenge
  await page.getByRole("button", { name: "Daily challenges" }).click();
  await page.getByRole("button", { name: "Mark Today Complete" }).click();
  await page.locator("aside.drawer.open .close-btn").click();

  await page.getByRole("button", { name: "Progress" }).click();
  await expect(page.locator("aside.drawer.open h2")).toHaveText("Your Progress");

  const stats = page.locator(".stat-value");
  await expect(stats.nth(0)).toHaveText("1"); // streak
  await expect(stats.nth(1)).toHaveText("1"); // lessons done
  await expect(stats.nth(2)).toHaveText("1"); // challenges done
});
