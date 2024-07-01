const config = {
  FAILURE_THRESHOLD: 0.065,
  FAIL_ON_MISSING_BASELINE: process.env.CI === 'true',
  ROOT_DIR: 'visual-regression-tests',
  REPORT_DIR: 'report',
  JSON_REPORT: {
    FILENAME: 'cypress_visual_report',
    OVERWRITE: true,
  },
  SCREENSHOTS_DIR: 'screenshots',
  RETRY_OPTIONS: {
    log: false,
    limit: 3,
    timeout: 10000,
    delay: 300,
  },
  CYPRESS_SCREENSHOT_OPTIONS: {
    capture: 'viewport',
  },
}

module.exports = config
