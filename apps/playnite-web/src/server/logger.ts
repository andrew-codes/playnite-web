import winston from 'winston'

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL ?? 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
    new winston.transports.File({
      filename: 'logs/server.errors.log',
      level: 'debug',
      format: winston.format.json(),
    }),
  ],
})

export default logger
