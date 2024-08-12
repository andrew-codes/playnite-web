import semanticRelease from 'semantic-release'
import stream from 'stream'

run()

async function run() {
  const config = {
    dryRun: true,
    branches: ['main', 'next'],
    plugins: [
      [
        '@semantic-release/commit-analyzer',
        {
          releaseRules: [
            {
              breaking: true,
              release: 'major',
            },
            {
              type: 'feat',
              release: 'minor',
            },
            {
              type: 'fix',
              release: 'patch',
            },
            {
              type: 'docs',
              scope: 'README',
              release: 'patch',
            },
            {
              type: 'chore',
              release: 'patch',
            },
          ],
          parserOpts: {
            noteKeywords: ['BREAKING CHANGE', 'BREAKING CHANGES', 'BREAKING'],
          },
        },
      ],
    ],
  }

  const stdoutBuffer = new stream.Writable({
    write: (chunk, encoding, next) => {
      next()
    },
  })
  const stderrBuffer = new stream.Writable({
    write: (chunk, encoding, next) => {
      next()
    },
  })

  try {
    const result = await semanticRelease(config, {
      cwd: process.cwd(),
      env: { ...process.env },
      stdout: stdoutBuffer,
      stderr: stderrBuffer,
    })

    if (result) {
      const { nextRelease } = result
      console.log(nextRelease.version)
    } else {
      process.exit(`No result`)
    }
  } catch (err) {
    process.exit(`The automated release failed with ${err}`)
  }
}
