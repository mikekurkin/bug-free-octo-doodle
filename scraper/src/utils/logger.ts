type LogLevel = 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';

const logLevels: Record<LogLevel, number> = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

const currentLevel = logLevels[process.env.LOG_LEVEL as LogLevel || 'INFO'];

export const logger = {
  error: (message: string, error?: unknown) => {
    if (currentLevel >= logLevels.ERROR) {
      console.error(`[ERROR] ${message}`, error);
    }
  },
  
  warn: (message: string, data?: unknown) => {
    if (currentLevel >= logLevels.WARN) {
      console.warn(`[WARN] ${message}`, data);
    }
  },
  
  info: (message: string) => {
    if (currentLevel >= logLevels.INFO) {
      console.info(`[INFO] ${message}`);
    }
  },
  
  debug: (message: string, data?: unknown) => {
    if (currentLevel >= logLevels.DEBUG) {
      console.debug(`[DEBUG] ${message}`, data);
    }
  },
};