import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

const testRunsDirectory = path.join(__dirname, '..', '.test-runs')
const mergeDirectory = path.join(
  __dirname,
  '..',
  '.test-runs',
  '.merge-reports',
)

fs.mkdirSync(mergeDirectory, {
  recursive: true,
})
fs.copyFileSync(
  path.join(testRunsDirectory, 'component', 'coverage-final.json'),
  path.join(mergeDirectory, 'from-cypress.json'),
)
fs.copyFileSync(
  path.join(testRunsDirectory, 'unit', 'coverage-final.json'),
  path.join(mergeDirectory, 'from-jest.json'),
)

const intermediateDirectory = path.join(
  __dirname,
  '..',
  '.test-runs',
  '.nyc_output',
)
fs.mkdirSync(intermediateDirectory, { recursive: true })
const outputDirectory = path.join(__dirname, '..', '.test-runs', 'coverage')
fs.mkdirSync(outputDirectory, { recursive: true })

run([
  `nyc merge ${mergeDirectory} && mv coverage.json ${path.join(intermediateDirectory, 'out.json')}`,
  `nyc report --reporter lcov --report-dir ${outputDirectory}`,
])

// --
function run(commands) {
  commands.forEach((command) => execSync(command, { stdio: 'inherit' }))
}
