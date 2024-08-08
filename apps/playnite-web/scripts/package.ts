import sh from 'shelljs'
import { getDockerTags } from 'versioning'
import pkg from '../package.json' with { type: 'json' }
import packageFiles from './utils/packageFiles'

async function run() {
  packageFiles()
  const { REGISTRY, OWNER, GITHUB_REF, PLATFORM, VERSION } = process.env

  if (!REGISTRY || !OWNER || !GITHUB_REF || !PLATFORM) {
    throw new Error('Missing environment variables')
  }

  let tags = await getDockerTags(VERSION ?? null, GITHUB_REF)
  const platforms = PLATFORM.split(',')

  await Promise.all(
    tags.flatMap((tag) =>
      platforms.map(
        async (platform) =>
          new Promise((resolve) => {
            const cpuArch = platform.includes('amd64')
              ? 'x64'
              : platform.includes('arm64')
                ? 'arm64'
                : platform.includes('arm/v7')
                  ? 'arm32v7'
                  : platform.includes('arm/v6')
                    ? 'arm32v6'
                    : 'x64'
            const baseImage = platform.includes('amd64')
              ? 'node'
              : platform.includes('arm64')
                ? 'arm64v8/node'
                : 'node'
            console.log(
              `Building image for ${platform} with cpu_arch ${cpuArch} and docker base image of ${baseImage}.`,
            )
            const child = sh.exec(
              `docker buildx build --platform ${platform} --build-arg cpu_arch=${cpuArch} --build-arg base_image=${baseImage} --tag "${REGISTRY}/${OWNER}/${pkg.name}:${tag}" --file Dockerfile .`,
              { async: true },
            )
            child.on('exit', resolve)
          }),
      ),
    ),
  )
}

run()
