import { Injectable } from '@nestjs/common';
import * as winston from 'winston';
import { customLogsColor } from './customLogging';

const { combine, timestamp, printf, colorize } = winston.format;

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};
winston.addColors(colors);

const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'http';
};

// Log Format
const logFormat = combine(
  timestamp({ format: 'DD-MM-YYYY HH:mm:ss:ms' }),
  printf((info) => {
    if (info.stack) {
      return `${info.timestamp} | ${info.message} \n Error Stack: ${info.stack} \n`;
    }
    return `${info.message} | ${customLogsColor.yellow}${info.timestamp} \n`;
  }),
);

const consoleOpts = {
  handleExceptions: true,
  level: process.env.NODE_ENV === 'production' ? 'error' : 'debug',
  format: combine(
    colorize({ all: true }),
    timestamp({ format: 'DD-MM-YYYY HH:mm:ss:ms' }),
  ),
};

const transports = [
  new winston.transports.Console(consoleOpts),

  // new WinstonDaily({
  //   level: 'error',
  //   datePattern: 'YYYY-MM-DD',
  //   dirname: path.join(__dirname, logDir, '/error'),
  //   filename: '%DATE%.error.log',
  //   maxFiles: 30,
  //   zippedArchive: true,
  // }),

  // new WinstonDaily({
  //   level: 'debug',
  //   datePattern: 'YYYY-MM-DD',
  //   dirname: path.join(__dirname, logDir, '/all'),
  //   filename: '%DATE%.all.log',
  //   maxFiles: 7,
  //   zippedArchive: true,
  // }),
];

@Injectable()
export class Logging {
  private readonly logger = winston.createLogger({
    level: level(),
    levels,
    format: logFormat,
    transports,
  });

  info(message: string) {
    this.logger.info(message);
  }

  error(message: string) {
    this.logger.error(message);
  }

  debug(message: string) {
    this.logger.debug(message);
  }

  debugCode(data: any) {
    this.logger.debug(JSON.stringify(data, null, 2));
  }
}
