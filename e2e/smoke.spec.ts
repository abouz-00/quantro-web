import { test, expect } from "@playwright/test";

test.describe("Landing page", () => {
  test("renders the landing page", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Quantro/);
  });

  test("has a sign-in entry point", async ({ page }) => {
    await page.goto("/");
    // Landing page should surface a way to sign in / get started
    const cta = page.getByRole("button", { name: /sign in|get started|log in/i }).first();
    await expect(cta).toBeVisible();
  });
});

test.describe("Auth guard", () => {
  test("redirects unauthenticated users from /dashboard to /", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForURL("/");
    expect(page.url()).toMatch(/\/$/);
  });

  test("redirects unauthenticated users from /log to /", async ({ page }) => {
    await page.goto("/log");
    await page.waitForURL("/");
    expect(page.url()).toMatch(/\/$/);
  });
});

test.describe("API protection", () => {
  test("returns 401 for unauthenticated /api/food-logs", async ({ request }) => {
    const res = await request.get("/api/food-logs");
    expect(res.status()).toBe(401);
  });

  test("returns 401 for unauthenticated /api/user/profile", async ({ request }) => {
    const res = await request.get("/api/user/profile");
    expect(res.status()).toBe(401);
  });
});
