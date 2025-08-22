import winston from 'winston'
import 'winston-daily-rotate-file'

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
    new winston.transports.DailyRotateFile({
      filename: 'logs/dev/info-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'info',
      maxFiles: '1d',
    }),
    new winston.transports.DailyRotateFile({
      filename: 'logs/dev/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxFiles: '1d',
    }),
    new winston.transports.DailyRotateFile({
      filename: 'logs/dev/verbose-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'verbose',
      maxFiles: '1d',
    }),
  ],
})

export default logger
