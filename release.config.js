const exclude = process.env.EXCLUDE ? `--exclude='${process.env.EXCLUDE}'` : ''

const config = {
  dryRun: false,
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
    [
      '@semantic-release/release-notes-generator',
      {
        presetConfig: {
          types: [
            { type: 'feat', section: 'Features', hidden: false },
            { type: 'fix', section: 'Bug Fixes', hidden: false },
            { type: 'docs', section: 'Miscellaneous Chores', hidden: false },
            { type: 'chore', section: 'Miscellaneous Chores', hidden: false },
          ],
        },
        parserOpts: {
          noteKeywords: ['BREAKING CHANGE', 'BREAKING CHANGES', 'BREAKING'],
        },
      },
    ],
    [
      '@semantic-release/exec',
      {
        verifyReleaseCmd: `yarn cross-env VERSION='${nextRelease.version}' yarn nx run-many --target=version ${exclude}`,
        publishCmd: `yarn cross-env VERSION='${nextRelease.version}' PUBLISH='true' yarn nx run-many --target=publish ${exclude}`,
      },
    ],
  ],
}

if (process.env.INCLUDE_GH_RELEASE === 'true') {
  config.plugins.push([
    '@semantic-release/github',
    {
      assets: [
        {
          path: '_packaged/**/*.*',
          label: 'Playnite Web Plugin',
        },
      ],
    },
  ])
}

module.exports = config
