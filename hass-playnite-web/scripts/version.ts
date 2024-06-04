import fs from 'fs'
import { merge } from 'lodash'
import path from 'path'
import config from '../config.json'
import pkg from '../package.json'

const newConfig = merge({}, config, { version: pkg.version })

fs.writeFileSync(
  path.join(__dirname, '..', 'config.json'),
  JSON.stringify(newConfig, null, 2),
)
