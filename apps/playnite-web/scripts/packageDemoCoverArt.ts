import fs from 'fs/promises'
import path from 'path'

async function run() {
  console.log('Copying demo game cover art assets')
  await fs.cp('public/cover-art', '_packaged/public/cover-art', {
    recursive: true,
  })
}

run().catch((error) => {
  console.error('FAILURE', error)
  process.exit(1)
})
