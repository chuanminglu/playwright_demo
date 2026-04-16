import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  // 配置多种测试报告形式
  reporter: [
    ['html', { open: 'never' }],                          // HTML报告（默认）
    ['json', { outputFile: 'test-results/results.json' }], // JSON报告（CI/CD集成）
    ['junit', { outputFile: 'test-results/junit.xml' }],   // JUnit XML（Jenkins等）
    ['list'],                                              // 终端列表输出
    ['github'],                                            // GitHub Actions集成
  ],
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        headless: true,
      },
    },
  ],
});