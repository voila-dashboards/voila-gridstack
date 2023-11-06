// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { expect, test, APIRequestContext, Page } from '@playwright/test';

async function beforeEach(
  page: Page,
  request: APIRequestContext
): Promise<void> {
  page.setDefaultTimeout(600000);
  page.setViewportSize({ width: 1920, height: 1080 });
  page.on('console', (message) => {
    console.log('CONSOLE MSG ---', message.text());
  });
}

test.describe('Template tests', () => {
  test.beforeEach(async ({ page, request }) => void beforeEach(page, request));

  test('Render iris_example.ipynb', async ({ page }) => {
    const notebookName = 'iris_example';
    await page.goto(`/voila/render/${notebookName}.ipynb?template=gridstack`),
      // wait for the widgets to load
      await page.waitForSelector('div.lm-Widget.jp-RenderedImage');
    await page.waitForTimeout(500);
    expect(await page.screenshot()).toMatchSnapshot(`${notebookName}.png`);
  });

  test('Render scotch_dashboard.ipynb', async ({ page }) => {
    const notebookName = 'scotch_dashboard';
    await page.goto(`/voila/render/${notebookName}.ipynb?template=gridstack`);
    // wait for the widgets to load
    await page.waitForSelector('div.lm-Widget.bqplot.figure.jupyter-widgets');
    await page.waitForTimeout(500);
    expect(await page.screenshot()).toMatchSnapshot(`${notebookName}.png`);
  });
});
