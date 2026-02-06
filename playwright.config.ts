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
    // 设置操作延迟（毫秒），方便观察浏览器操作
    slowMo: 500,
    // 添加截图和视频配置
    screenshot: 'only-on-failure',  // 失败时截图
    video: 'retain-on-failure',     // 失败时保留视频
  },
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // 强制使用有头模式
        headless: false,
      },
    },
  ],
});