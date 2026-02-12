module.exports = {
  testEnvironment: 'node',
  transform: {},
  maxWorkers: 2,
  // Increase timeout for CI environments (GitHub Actions can be slower)
  testTimeout: process.env.CI ? 120000 : 60000,
  globalSetup: process.env.CI ? '<rootDir>/tests/setupDatabase.js' : undefined,
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};
