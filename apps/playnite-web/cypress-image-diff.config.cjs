const config = {
  FAILURE_THRESHOLD: process.env.TEST === 'e2e' ? 0.12 : 0.09,
  FAIL_ON_MISSING_BASELINE: process.env.CI === 'true',
  ROOT_DIR: 'visual-regression-tests',
  REPORT_DIR: process.env.TEST ? `${process.env.TEST}-report` : 'report',
  JSON_REPORT: {
    FILENAME: process.env.TEST
      ? `${process.env.TEST}-cypress_visual_report`
      : 'cypress_visual_report',
    OVERWRITE: true,
  },
  SCREENSHOTS_DIR: process.env.TEST
    ? `${process.env.TEST}-screenshots`
    : 'screenshots',
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
