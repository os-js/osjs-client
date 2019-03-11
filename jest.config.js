module.exports = {
  collectCoverage: true,
  coverageReporters: ['lcov'],

  setupFilesAfterEnv: [
    '<rootDir>/__mocks__/setup.js'
  ],

  moduleNameMapper: {
    '^osjs$': '<rootDir>/__mocks__/core.js',
    '^.+\\.scss$': '<rootDir>/__mocks__/null-module.js',
    '^.+\\.(png|jpe?g|gif)$': '<rootDir>/__mocks__/null-module.js'
  },

  coveragePathIgnorePatterns: [
    'src/config.js',
    'src/providers',
    '/node_modules/',
    '/locale/'
  ]
};
