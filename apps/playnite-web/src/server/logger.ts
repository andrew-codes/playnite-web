import winston from 'winston'

const transports: Array<winston.transport> = [
  new winston.transports.Console({
    level: process.env.NODE_ENV === 'development' ? 'silly' : 'info',
    format: winston.format.simple(),
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

transports.forEach((transport) => {
  transport.on('error', (err) => {
    console.error('Logger transport error:', err)
  })
})

console.info('Logger initialized with level:', process.env.LOG_LEVEL ?? 'info')

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL ?? 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports: transports,
})

export default logger
