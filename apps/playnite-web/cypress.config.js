const { defineConfig } = require('cypress')
const fs = require('fs')
const webpackPreprocessor = require('@cypress/webpack-preprocessor')
const { merge } = require('lodash')
const codeCoverage = require('@cypress/code-coverage/task')

const config = {
  chromeWebSecurity: false,
  viewportWidth: 1920,
  viewportHeight: 1080,
  e2e: {
    baseUrl: 'http://localhost:3000',
    setupNodeEvents: (on, config) => {
      const { viewportWidth, viewportHeight } = config
      on('before:browser:launch', (browser, launchOptions) => {
        switch (browser?.name) {
          case 'chrome':
          case 'edge':
            launchOptions.args.push(
              `--window-size=${viewportWidth},${viewportHeight}`,
            )
            launchOptions.args.push('--force-device-scale-factor=1')
            break
          case 'electron':
          default:
            launchOptions.preferences.width = viewportWidth
            launchOptions.preferences.height = viewportHeight
        }

        return launchOptions
      })

      on('after:spec', (spec, results) => {
        if (process.env.CI === 'false') {
          return
        }
        if (results && results.video) {
          // Do we have failures for any retry attempts?
          const failures = results.tests.some((test) =>
            test.attempts.some((attempt) => attempt.state === 'failed'),
          )
          if (!failures) {
            fs.unlinkSync(results.video)
          }
        }
      })

      const webpackConfig = merge({}, webpackPreprocessor.defaultOptions, {
        module: {
          rules: [
            {
              test: /\.?tsx?$/,
              loader: 'babel-loader',
              options: {
                presets: [
                  '@babel/preset-env',
                  ['@babel/preset-react', { typescript: true }],
                  [
                    '@babel/preset-typescript',
                    {
                      isTSX: true,
                      allExtensions: true,
                    },
                  ],
                ],
              },
            },
            {
              test: /\.tsx?/,
              loader: 'ts-loader',
              options: {
                transpileOnly: true,
                compilerOptions: {
                  jsx: 'react-jsx',
                },
              },
            },
          ],
        },
        resolve: {
          extensions: ['.ts', '.tsx', '.js', '.json'],
          alias: {
            'cypress-image-diff-js': require.resolve('cypress-image-diff-js'),
            'cypress-plugin-tab': require.resolve('cypress-plugin-tab'),
          },
        },
      })

      on('file:preprocessor', webpackPreprocessor(webpackConfig))

      return require('cypress-image-diff-js/plugin')(on, config)
    },
  },
  component: {
    codeCoverage: {
      exclude: ['**/testUtils/**', '**/cypress/**'],
    },
    specPattern:
      process.env.VISUAL === 'true'
        ? '**/__component_tests__/**/*.visual.tsx'
        : '**/__component_tests__/**/*.test.tsx',
    excludeSpecPattern: [],
    devServer: {
      framework: 'react',
      bundler: 'webpack',
      webpackConfig: async () => {
        const config = {
          mode: 'development',
          devtool: 'source-map',
          module: {
            rules: [
              {
                test: /\.?tsx?$/,
                loader: 'babel-loader',
                options: {
                  presets: [
                    '@babel/preset-env',
                    ['@babel/preset-react', { typescript: true }],
                    [
                      '@babel/preset-typescript',
                      {
                        isTSX: true,
                        allExtensions: true,
                      },
                    ],
                  ],
                  plugins: ['babel-plugin-istanbul'],
                },
              },
              {
                test: /\.tsx?/,
                loader: 'ts-loader',
                options: {
                  transpileOnly: true,
                  compilerOptions: {
                    jsx: 'react-jsx',
                  },
                },
              },
            ],
          },
          resolve: {
            extensions: ['.ts', '.tsx', '.js', '.json'],
          },
          plugins: [],
        }
        return config
      },
    },
    video: process.env.CI === 'true',
    videoCompression: 32,
    setupNodeEvents: (on, config) => {
      const { viewportWidth, viewportHeight } = config
      on('before:browser:launch', (browser, launchOptions) => {
        switch (browser?.name) {
          case 'chrome':
          case 'edge':
            launchOptions.args.push(
              `--window-size=${viewportWidth},${viewportHeight}`,
            )
            launchOptions.args.push('--force-device-scale-factor=1')
            break
          case 'electron':
          default:
            launchOptions.preferences.width = viewportWidth
            launchOptions.preferences.height = viewportHeight
        }

        return launchOptions
      })

      on('after:spec', (spec, results) => {
        if (process.env.CI === 'false') {
          return
        }
        if (results && results.video) {
          // Do we have failures for any retry attempts?
          const failures = results.tests.some((test) =>
            test.attempts.some((attempt) => attempt.state === 'failed'),
          )
          if (!failures) {
            fs.unlinkSync(results.video)
          }
        }
      })

      codeCoverage(on, config)
      return require('cypress-image-diff-js/plugin')(on, config)
    },
  },
}

module.exports = defineConfig(config)
