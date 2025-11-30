/**
 * Wrapper script to run the server and save coverage data on exit
 * This ensures coverage from Istanbul-instrumented code is properly saved
 */

const fs = require('fs')
const path = require('path')

// Ensure .nyc_output directory exists
const nycOutputDir = path.join(process.cwd(), '.nyc_output')
if (!fs.existsSync(nycOutputDir)) {
  fs.mkdirSync(nycOutputDir, { recursive: true })
}

// Hook into process exit to save coverage
function saveCoverage() {
  if (global.__coverage__) {
    const coverageFile = path.join(nycOutputDir, `coverage-${process.pid}.json`)
    try {
      fs.writeFileSync(coverageFile, JSON.stringify(global.__coverage__))
      console.log(`Coverage data saved to ${coverageFile}`)
    } catch (err) {
      console.error('Failed to write coverage data:', err)
    }
  } else {
    console.warn('No coverage data found in global.__coverage__')
  }
}

// Register exit handlers
process.on('exit', saveCoverage)
process.on('SIGINT', () => {
  saveCoverage()
  process.exit(130)
})
process.on('SIGTERM', () => {
  saveCoverage()
  process.exit(143)
})

// Now require and run the actual server
require('../_packaged/server.js')
