import codeCoverage from '@cypress/code-coverage/task.js'
import mqtt from 'async-mqtt'
import { defineConfig } from 'cypress'
import imageDiff from 'cypress-image-diff-js/plugin'
import fs from 'fs'
import { MongoClient } from 'mongodb'

const config = {
  chromeWebSecurity: false,
  viewportWidth: 1920,
  viewportHeight: 1080,
  e2e: {
    env: {
      codeCoverage: {
        exclude: [
          '**/testUtils/**',
          '**/cypress/**',
          '**/__tests__/**',
          '**/__component_tests__/**',
          '**/public/assets/**',
        ],
        url: 'http://localhost:3000/__coverage__',
      },
    },
    coverage: true,
    baseUrl: 'http://localhost:3000',
    video: process.env.CMD === 'run',
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
            launchOptions.args.push(
              `--force-device-scale-factor=${process.env.CMD !== 'run' ? process.env.SCALE && '1' : '1'}`,
            )
            break
          case 'electron':
          default:
            launchOptions.preferences.width = viewportWidth
            launchOptions.preferences.height = viewportHeight
            launchOptions.args.push(
              `--force-device-scale-factor=${process.env.CMD !== 'run' ? process.env.SCALE && '1' : '1'}`,
            )
        }

        return launchOptions
      })

      on('after:spec', (spec, results) => {
        if (process.env.CMD !== 'run') {
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

      on('task', {
        mqttPublish({ topic, payload }) {
          const host = 'localhost'
          const port = 1883
          const username = 'local'
          const password = 'dev'
          return mqtt
            .connectAsync(`tcp://${host}`, {
              password,
              port,
              username,
            })
            .then((client) => {
              client.publish(topic, payload)
              return null
            })
        },
      })

      const url = `mongodb://${process.env.DB_HOST ?? 'localhost'}:${process.env.DB_PORT ?? '27017'}`
      const username = process.env.DB_USERNAME ?? 'local'
      const password = process.env.DB_PASSWORD ?? 'dev'
      const client = new MongoClient(url, {
        auth: {
          username,
          password,
        },
        enableUtf8Validation: false,
      })
      on('task', {
        async updateDatabase({ collection, filter, update }) {
          try {
            await client.connect()
            const db = client.db('games')
            const dbCollection = db.collection(collection)
            return dbCollection.updateMany(filter, update)
          } catch {
            await client.close()
          }
        },
      })

      codeCoverage(on, config)

      return imageDiff(on, config)
    },
  },
  component: {
    codeCoverage: {
      exclude: [
        '**/testUtils/**',
        '**/cypress/**',
        '**/__tests__/**',
        '**/__component_tests__/**',
      ],
    },
    coverage: true,
    specPattern: '**/__component_tests__/**/*.test.tsx',
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
                test: /\.tsx?$/,
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
    video: process.env.CMD === 'run',
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
            launchOptions.args.push(
              `--force-device-scale-factor=${process.env.CMD !== 'run' ? process.env.SCALE && '1' : '1'}`,
            )
            break
          case 'electron':
          default:
            launchOptions.preferences.width = viewportWidth
            launchOptions.preferences.height = viewportHeight
            launchOptions.args.push(
              `--force-device-scale-factor=${process.env.CMD !== 'run' ? process.env.SCALE && '1' : '1'}`,
            )
        }

        return launchOptions
      })

      on('after:spec', (spec, results) => {
        if (process.env.CMD !== 'run') {
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

      return imageDiff(on, config)
    },
  },
}

export default defineConfig(config)
