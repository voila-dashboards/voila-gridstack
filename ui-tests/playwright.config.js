module.exports = {
  timeout: 120000,
  reporter: [[process.env.CI ? 'dot' : 'list'], ['html']],
  use: {
    baseURL: 'http://localhost:8888',
    trace: 'on-first-retry',
    video: 'retain-on-failure',
  },
  retries: 1,
  expect: {
    toMatchSnapshot: {
      maxDiffPixelRatio: 0.01,
    },
  },
  webServer: [
    {
      command: 'yarn start',
      url: 'http://localhost:8888/lab',
      timeout: 120 * 1000,
      reuseExistingServer: !process.env.CI,
    },
  ],
  testDir: './tests',
};
