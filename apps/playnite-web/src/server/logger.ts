import winston from 'winston'
import 'winston-daily-rotate-file'

const customLevels = {
  levels: {
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
    silly: 'rainbow',
  },
}

winston.addColors(customLevels.colors)

const transports: Array<winston.transport> = []

if (process.env.NODE_ENV !== 'development' || process.env.TEST === 'e2e') {
  transports.push(
    new winston.transports.Console({
      level: process.env.NODE_ENV === 'development' ? 'silly' : 'info',
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
      ),
    }),
  )

  transports.push(
    new winston.transports.DailyRotateFile({
      dirname: 'logs',
      filename: 'dev-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'silly',
      maxFiles: '1d',
    }),
  )
  transports.push(
    new winston.transports.DailyRotateFile({
      dirname: 'logs',
      filename: 'dev-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxFiles: '1d',
    }),
  )
}

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

export default logger
