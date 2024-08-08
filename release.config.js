const { verify } = require('crypto')

const config = {
  dryRun: true,
  branches: ['main', 'next'],
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',

    [
      '@semantic-release/exec',
      {
        verifyReleaseCmd:
          'yarn cross-env VERSION=${nextRelease.version} yarn nx run-many --target=version --all',
        publishCmd:
          'yarn cross-env VERSION=${nextRelease.version} yarn nx run-many --target=package --all',
      },
    ],
    [
      '@semantic-release/git',
      {
        assets: ['hass-*/config.js'],
        message: 'chore(release): update HASS add-on version. [skip ci]',
      },
    ],
    '@semantic-release/github',
    '@semantic-release/changelog',
  ],
}

module.exports = config
