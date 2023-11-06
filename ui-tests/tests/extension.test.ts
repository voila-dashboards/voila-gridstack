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

test.describe('JupyterLab extension tests', () => {
  test.beforeEach(({ page, request }) => void beforeEach(page, request));

  test('Render scotch_dashboard.ipynb', async ({ page }) => {
    const notebookName = 'scotch_dashboard';
    await page.goto(`/lab/tree/${notebookName}.ipynb?reset`);
    // wait for the widgets to load
    await page
      .getByRole('button', { name: 'Open with Voilà GridStack editor' })
      .click();
    await page.locator('.gridstack-toolbar-button');
    await page.waitForTimeout(2500);
    expect(await page.screenshot()).toMatchSnapshot(`${notebookName}.png`);
    await page.getByText('File', { exact: true }).click();
    await page.locator('#jp-mainmenu-file').getByText('Close All Tabs').click();
  });
});
