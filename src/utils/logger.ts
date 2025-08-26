export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  CRITICAL = 4
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  data?: any;
  error?: Error;
}

class Logger {
  private logLevel: LogLevel;
  private isProduction: boolean;

  constructor() {
    this.isProduction = import.meta.env.MODE === 'production';
    this.logLevel = this.isProduction ? LogLevel.INFO : LogLevel.DEBUG;
  }

  private formatMessage(entry: LogEntry): string {
    const levelName = LogLevel[entry.level];
    const timestamp = entry.timestamp;
    const context = entry.context ? `[${entry.context}]` : '';
    const message = entry.message;
    
    return `${timestamp} [${levelName}]${context}: ${message}`;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.logLevel;
  }

  private log(level: LogLevel, message: string, context?: string, data?: any, error?: Error) {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      data,
      error
    };

    const formattedMessage = this.formatMessage(entry);

    switch (level) {
      case LogLevel.DEBUG:
        console.debug(formattedMessage, data || '');
        break;
      case LogLevel.INFO:
        console.info(formattedMessage, data || '');
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage, data || '');
        break;
      case LogLevel.ERROR:
        console.error(formattedMessage, data || '', error || '');
        break;
      case LogLevel.CRITICAL:
        console.error('🚨 CRITICAL:', formattedMessage, data || '', error || '');
        break;
    }

    // In production, you would send critical errors to your monitoring service
    if (level >= LogLevel.ERROR && this.isProduction) {
      this.sendToMonitoring(entry);
    }
  }

  private sendToMonitoring(entry: LogEntry) {
    // This would integrate with services like Sentry, LogRocket, etc.
    // For now, we'll just log to console in production
    if (entry.level === LogLevel.CRITICAL) {
      console.error('🚨 CRITICAL ERROR - Should be sent to monitoring service:', entry);
    }
  }

  debug(message: string, context?: string, data?: any) {
    this.log(LogLevel.DEBUG, message, context, data);
  }

  info(message: string, context?: string, data?: any) {
    this.log(LogLevel.INFO, message, context, data);
  }

  warn(message: string, context?: string, data?: any) {
    this.log(LogLevel.WARN, message, context, data);
  }

  error(message: string, context?: string, data?: any, error?: Error) {
    this.log(LogLevel.ERROR, message, context, data, error);
  }

  critical(message: string, context?: string, data?: any, error?: Error) {
    this.log(LogLevel.CRITICAL, message, context, data, error);
  }

  // Specialized logging methods
  apiCall(endpoint: string, method: string, status: number, duration: number) {
    const level = status >= 400 ? LogLevel.WARN : LogLevel.INFO;
    this.log(level, `API ${method} ${endpoint}`, 'API', {
      status,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    });
  }

  userAction(action: string, userId: string, details?: any) {
    this.info(`User action: ${action}`, 'USER_ACTION', {
      userId,
      action,
      details,
      timestamp: new Date().toISOString()
    });
  }

  securityEvent(event: string, details: any) {
    this.warn(`Security event: ${event}`, 'SECURITY', details);
  }

  performanceMetric(metric: string, value: number, context?: string) {
    this.info(`Performance: ${metric} = ${value}ms`, 'PERFORMANCE', {
      metric,
      value,
      context,
      timestamp: new Date().toISOString()
    });
  }
}

export const logger = new Logger();

// Convenience functions for common logging patterns
export const logApiCall = (endpoint: string, method: string, status: number, duration: number) => {
  logger.apiCall(endpoint, method, status, duration);
};

export const logUserAction = (action: string, userId: string, details?: any) => {
  logger.userAction(action, userId, details);
};

export const logSecurityEvent = (event: string, details: any) => {
  logger.securityEvent(event, details);
};

export const logPerformance = (metric: string, value: number, context?: string) => {
  logger.performanceMetric(metric, value, context);
};
