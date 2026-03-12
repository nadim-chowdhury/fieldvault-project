import { Injectable, LoggerService, Scope } from '@nestjs/common';
import { createLogger, format, transports, Logger } from 'winston';

@Injectable({ scope: Scope.TRANSIENT })
export class WinstonLoggerService implements LoggerService {
  private logger: Logger;
  private context = 'Application';

  constructor() {
    const isDev = process.env.NODE_ENV !== 'production';

    this.logger = createLogger({
      level: isDev ? 'debug' : 'info',
      format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.errors({ stack: true }),
        isDev
          ? format.combine(format.colorize(), format.simple())
          : format.json(),
      ),
      defaultMeta: { service: 'fieldvault-api' },
      transports: [
        new transports.Console(),
        // In production, add file or external log service transport here
        ...(isDev
          ? []
          : [
              new transports.File({
                filename: 'logs/error.log',
                level: 'error',
                maxsize: 5_000_000,
                maxFiles: 5,
              }),
              new transports.File({
                filename: 'logs/combined.log',
                maxsize: 10_000_000,
                maxFiles: 5,
              }),
            ]),
      ],
    });
  }

  setContext(context: string) {
    this.context = context;
  }

  log(message: string, ...meta: any[]) {
    this.logger.info(message, { context: this.context, ...this.parseMeta(meta) });
  }

  error(message: string, trace?: string, ...meta: any[]) {
    this.logger.error(message, {
      context: this.context,
      trace,
      ...this.parseMeta(meta),
    });
  }

  warn(message: string, ...meta: any[]) {
    this.logger.warn(message, { context: this.context, ...this.parseMeta(meta) });
  }

  debug(message: string, ...meta: any[]) {
    this.logger.debug(message, { context: this.context, ...this.parseMeta(meta) });
  }

  verbose(message: string, ...meta: any[]) {
    this.logger.verbose(message, { context: this.context, ...this.parseMeta(meta) });
  }

  private parseMeta(meta: any[]): Record<string, any> {
    if (meta.length === 0) return {};
    if (meta.length === 1 && typeof meta[0] === 'string') {
      return { context: meta[0] };
    }
    return meta[0] || {};
  }
}
