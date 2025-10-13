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
      '@andrew-codes/playnite-plugin-installer-manifest',
      {
        manifestFilePath: 'apps/PlayniteWebPlugin/src/manifest.yaml',
        extensionFilePath: 'apps/PlayniteWebPlugin/src/extension.yaml',
        requiredApiVersion: '6.12.0',
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
        verifyReleaseCmd: `yarn cross-env VERSION='\${nextRelease.version}' yarn nx run-many --target=version ${exclude}`,
        publishCmd: `yarn cross-env VERSION='\${nextRelease.version}' yarn nx run-many --target=publish ${exclude}`,
      },
    ],
    [
      '@semantic-release/github',
      {
        assets: [
          {
            path: '_packaged/**/*.*',
            label: 'Playnite Web Plugin',
          },
        ],
      },
    ],
    [
      '@semantic-release/git',
      {
        assets: [
          'apps/PlayniteWebPlugin/src/manifest.yaml',
          'apps/PlayniteWebPlugin/src/extension.yaml',
        ],
        message:
          'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
      },
    ],
  ],
}

module.exports = config
