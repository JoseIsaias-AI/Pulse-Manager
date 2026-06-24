export const performanceIt = process.env.RUN_PERFORMANCE_TESTS === 'true' ? it : it.skip;
