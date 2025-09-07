import fs from 'fs/promises'
import path from 'path'

async function run() {
  await fs.mkdir(path.join('_packaged/.next/static/media'), {
    recursive: true,
  })
  console.log('Copying demo game cover art assets')
  await fs.cp(
    'public/game-assets',
    '_packaged/.next/static/media/game-assets',
    {
      recursive: true,
    },
  )
}

run().catch((error) => {
  console.error('FAILURE', error)
  process.exit(1)
})
