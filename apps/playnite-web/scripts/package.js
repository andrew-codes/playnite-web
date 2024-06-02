import { getDockerTags } from 'versioning'
import fs from 'fs/promises'
import path from 'path'
import sh from 'shelljs'
import pkg from '../package.json' assert { type: 'json' }

async function run() {
  sh.cp('-R', 'build/', '_packaged/')
  sh.cp('-R', 'public/', '_packaged/')
  sh.cp('-R', 'server.mjs/', '_packaged')

  const pkgJson = { ...pkg }
  delete pkgJson.devDependencies
  await fs.writeFile(
    path.join('_packaged', 'package.json'),
    JSON.stringify(pkgJson, null, 2),
  )

  const { REGISTRY, OWNER, GITHUB_REF } = process.env

  if (!REGISTRY || !OWNER || !GITHUB_REF) {
    throw new Error('Missing environment variables')
  }

  let tags = await getDockerTags(pkg.version, GITHUB_REF)

  for (const tag of tags) {
    sh.exec(
      `docker build --tag "${REGISTRY}/${OWNER}/${pkg.name}:${tag}" --file Dockerfile ../../`,
    )
  }
}

run()
