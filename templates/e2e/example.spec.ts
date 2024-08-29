import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');

  let title = await page.title();
  expect(title).toContain('{{PLACEHOLDER}}')
})
