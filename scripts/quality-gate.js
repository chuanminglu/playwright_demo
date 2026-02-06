const fs = require('fs');
const path = require('path');

// 读取JSON测试结果
const resultsPath = path.join(__dirname, '..', 'test-results', 'results.json');

console.log('🎭 Playwright质量门检查');
console.log('=====================================');

if (!fs.existsSync(resultsPath)) {
  console.error('❌ 找不到测试结果文件: test-results/results.json');
  console.error('   请先运行: npx playwright test');
  process.exit(1);
}

const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
const stats = results.stats;

// 打印测试统计
console.log(`✅ 通过测试:     ${stats.expected}`);
console.log(`❌ 失败测试:     ${stats.unexpected}`);
console.log(`⏭️  跳过测试:     ${stats.skipped}`);
console.log(`⚠️  不稳定测试:   ${stats.flaky}`);
console.log(`⏱️  总执行时间:   ${(results.duration / 1000).toFixed(2)}秒`);
console.log('=====================================');

// 定义质量门标准
const QUALITY_GATE = {
  maxFailures: 0,        // 允许的最大失败测试数
  maxFlaky: 0,           // 允许的最大不稳定测试数
  maxDurationSeconds: 300, // 最大执行时间（秒）
};

// 检查质量门标准
const failures = [];

if (stats.unexpected > QUALITY_GATE.maxFailures) {
  failures.push(`❌ 失败测试数 (${stats.unexpected}) 超过标准 (${QUALITY_GATE.maxFailures})`);
}

if (stats.flaky > QUALITY_GATE.maxFlaky) {
  failures.push(`⚠️  不稳定测试数 (${stats.flaky}) 超过标准 (${QUALITY_GATE.maxFlaky})`);
}

const durationSeconds = results.duration / 1000;
if (durationSeconds > QUALITY_GATE.maxDurationSeconds) {
  failures.push(`⏱️  执行时间 (${durationSeconds.toFixed(2)}秒) 超过标准 (${QUALITY_GATE.maxDurationSeconds}秒)`);
}

// 输出结果
console.log();
if (failures.length > 0) {
  console.error('🚫 质量门检查失败！');
  console.error();
  failures.forEach(failure => console.error(`   ${failure}`));
  console.error();
  console.error('📋 需要解决以下问题：');
  console.error('   1. 修复所有失败的测试');
  console.error('   2. 修复或移除不稳定的测试');
  console.error('   3. 优化慢速测试');
  console.error();
  process.exit(1);
}

console.log('✅ 质量门检查通过！');
console.log();
console.log('📊 所有标准都已满足：');
console.log(`   ✓ 失败测试: ${stats.unexpected}/${QUALITY_GATE.maxFailures}`);
console.log(`   ✓ 不稳定测试: ${stats.flaky}/${QUALITY_GATE.maxFlaky}`);
console.log(`   ✓ 执行时间: ${durationSeconds.toFixed(2)}s/${QUALITY_GATE.maxDurationSeconds}s`);
console.log();

process.exit(0);
