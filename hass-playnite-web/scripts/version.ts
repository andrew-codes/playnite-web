import fs from 'fs'
import { merge } from 'lodash'
import path from 'path'
import sh from 'shelljs'
import config from '../config.json'
import pkg from '../package.json'

const newConfig = merge({}, config, { version: pkg.version })

fs.writeFileSync(
  path.join(__dirname, '..', 'config.json'),
  JSON.stringify(newConfig, null, 2),
)
sh.exec(`git add . && git commit --amend --no-edit`)
