import winston from 'winston'

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
      ),
    }),
    new winston.transports.File({
      filename: 'logs/dev/info.log',
      level: 'info',
    }),
    new winston.transports.File({
      filename: 'logs/dev/error.log',
      level: 'error',
    }),
    new winston.transports.File({
      filename: 'logs/dev/verbose.log',
      level: 'verbose',
    }),
  ],
})

export default logger
