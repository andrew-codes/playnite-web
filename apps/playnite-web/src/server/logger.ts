import winston from 'winston'

const customLevels = {
  levels: {
    e2e: 0,
    error: 1,
    warn: 2,
    info: 3,
    http: 4,
    verbose: 5,
    debug: 6,
    silly: 7,
  },
  colors: {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    verbose: 'gray',
    debug: 'blue',
    e2e: 'cyan',
    silly: 'rainbow',
  },
}

winston.addColors(customLevels.colors)

const transports: Array<winston.transport> = [
  new winston.transports.Console({
    level: process.env.NODE_ENV === 'development' ? 'silly' : 'info',
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple(),
    ),
  }),
]

transports.push(
  new winston.transports.File({
    dirname: 'logs',
    filename: 'server.log',
    level: 'silly',
  }),
)

transports.push(
  new winston.transports.File({
    dirname: 'logs',
    filename: 'error.log',
    level: 'error',
  }),
)
transports.push(
  new winston.transports.File({
    dirname: 'logs',
    filename: 'e2e.log',
    level: 'e2e',
  }),
)

transports.forEach((transport) => {
  transport.on('error', (err) => {
    console.error('Logger transport error:', err)
  })
})

console.info('Logger initialized with level:', process.env.LOG_LEVEL ?? 'info')

const logger = winston.createLogger({
  levels: customLevels.levels,
  level: process.env.LOG_LEVEL ?? 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports: transports,
})

declare module 'winston' {
  interface Logger {
    e2e(message: string, meta?: any): Logger
  }
}

export default logger
