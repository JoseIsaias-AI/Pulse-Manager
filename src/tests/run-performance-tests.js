const { spawnSync } = require('child_process');

const result = spawnSync(
  process.execPath,
  [require.resolve('jest/bin/jest'), ...process.argv.slice(2)],
  {
    stdio: 'inherit',
    env: {
      ...process.env,
      RUN_PERFORMANCE_TESTS: 'true'
    }
  }
);

process.exit(result.status ?? 1);
