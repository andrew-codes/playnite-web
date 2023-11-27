const { defaults } = require("jest-config");

const defaultConfig = {
  transform: {
    "^.+\\.(j|t)sx?$": [
      "ts-jest",
      {
        useESM: true,
      },
    ],
  },
  resetMocks: true,
  modulePathIgnorePatterns: ["<rootDir>/.*/\\.dist/"],
  passWithNoTests: true,
  coverageDirectory: "<rootDir>/.test-runs/unit",
  collectCoverage: true,
  moduleFileExtensions: [...defaults.moduleFileExtensions, "ts", "tsx"],
  collectCoverageFrom: ["**/src/**", "**/scripts/**"],
  coveragePathIgnorePatterns: ["/__tests__/", "/__mocks__/"],
  setupFiles: ["<rootDir>/.tests/setupEnvVars.ts"],
};

module.exports = defaultConfig;
