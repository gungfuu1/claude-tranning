import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// Acceptance scenarios from docs/002-about-page.spec.md.

test("AS-01 opens with a single h1", async ({ page }) => {
  const response = await page.goto("/about");
  expect(response?.status()).toBe(200);
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("h1")).toHaveText("ศูนย์อบรมออนไลน์ การไฟฟ้าส่วนภูมิภาค");
});

test("AS-02 has the sections in order and 3 benefit cards", async ({ page }) => {
  await page.goto("/about");
  await expect(page.locator("main h2")).toHaveText([
    "พันธกิจและวิสัยทัศน์",
    "สิ่งที่ผู้เรียนได้รับ",
    "ผลการดำเนินงาน",
    "ติดต่อเรา",
  ]);
  await expect(page.getByTestId("benefit-card")).toHaveCount(3);
});

test("AS-03 links to all courses", async ({ page }) => {
  await page.goto("/about");
  await page.getByRole("link", { name: "ดูหลักสูตรทั้งหมด" }).click();
  await expect(page).toHaveURL("/courses");
});

test("AS-04 formats numbers and the as-of date", async ({ page }) => {
  await page.goto("/about");
  await expect(page.getByText("12,500", { exact: true })).toBeVisible();
  await expect(page.getByText("ข้อมูล ณ 30 กันยายน 2569")).toBeVisible();
});

test("AS-06 phone and email are one-click links", async ({ page }) => {
  await page.goto("/about");
  const contact = page.locator("main address");
  await expect(contact.getByRole("link", { name: "02-123-4567" })).toHaveAttribute("href", "tel:021234567");
  await expect(contact.getByRole("link", { name: "training@example.com" })).toHaveAttribute(
    "href",
    "mailto:training@example.com",
  );
});

test("AS-07 sets the title and description", async ({ page }) => {
  await page.goto("/about");
  await expect(page).toHaveTitle("เกี่ยวกับเรา | ศูนย์อบรมออนไลน์ กฟภ.");
  const hero = await page.locator("h1 + p").textContent();
  await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", hero ?? "");
});

test("AS-08 main menu links to /about and marks it current only there", async ({ page }) => {
  const aboutLink = page.locator("header nav").getByRole("link", { name: "เกี่ยวกับเรา" });

  await page.goto("/");
  await expect(aboutLink).toHaveAttribute("href", "/about");
  await expect(aboutLink).not.toHaveAttribute("aria-current");

  await page.goto("/about");
  await expect(aboutLink).toHaveAttribute("aria-current", "page");
});

test("AS-09 has no serious or critical axe violations", async ({ page }) => {
  await page.goto("/about");
  const { violations } = await new AxeBuilder({ page }).analyze();
  const blocking = violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  expect(blocking, JSON.stringify(blocking.map((v) => [v.id, v.nodes.map((n) => n.target)]), null, 2)).toEqual([]);
});

test.describe("AS-10 mobile", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("no horizontal scroll and cards stack vertically", async ({ page }) => {
    await page.goto("/about");
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);

    const boxes = await page.getByTestId("benefit-card").evaluateAll((cards) =>
      cards.map((card) => card.getBoundingClientRect().toJSON() as DOMRect),
    );
    expect(boxes).toHaveLength(3);
    for (let i = 1; i < boxes.length; i++) {
      expect(boxes[i].x).toBe(boxes[0].x);
      expect(boxes[i].y).toBeGreaterThanOrEqual(boxes[i - 1].y + boxes[i - 1].height);
    }
  });
});
