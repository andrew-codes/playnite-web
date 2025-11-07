const stream = require('stream')

run()

async function run() {
  const { default: semanticRelease } = await import('semantic-release')
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
              release: 'patch',
            },
            {
              type: 'perf',
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
      console.log('No result')
      process.exit(1)
    }
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}
