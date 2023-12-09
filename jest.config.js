const { defaults } = require("jest-config");
const glob = require("glob");

const setupFiles = glob
  .sync("**/.tests/setupFiles.ts")
  .map((path) => `<rootDir>/${path}`);

const defaultConfig = {
  transform: {
    "^.+\\.(j|t)sx?$": ["ts-jest", {}],
  },
  resetMocks: true,
  modulePathIgnorePatterns: ["<rootDir>/.*/\\.dist/"],
  passWithNoTests: true,
  coverageDirectory: "<rootDir>/.test-runs/unit",
  collectCoverage: true,
  moduleFileExtensions: [...defaults.moduleFileExtensions, "ts", "tsx"],
  collectCoverageFrom: ["**/src/**", "**/scripts/**"],
  coveragePathIgnorePatterns: ["/__tests__/", "/__mocks__/"],
  setupFiles: setupFiles,
};

module.exports = defaultConfig;
