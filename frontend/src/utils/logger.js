/**
 * Production-grade structured logger for the frontend client.
 * Provides consistent formatting and metadata tracing similar to Pino/Winston.
 */

const IS_PROD = import.meta.env.PROD;

const formatPayload = (level, message, meta = {}) => {
  const timestamp = new Date().toISOString();
  return {
    timestamp,
    level,
    message,
    ...(meta && typeof meta === 'object' ? meta : { detail: meta })
  };
};

export const logger = {
  debug: (message, meta) => {
    if (!IS_PROD) {
      const payload = formatPayload('DEBUG', message, meta);
      console.debug(`[${payload.timestamp}] [DEBUG] ${payload.message}`, payload);
    }
  },

  info: (message, meta) => {
    const payload = formatPayload('INFO', message, meta);
    console.info(`[${payload.timestamp}] [INFO] ${payload.message}`, payload);
  },

  warn: (message, meta) => {
    const payload = formatPayload('WARN', message, meta);
    console.warn(`[${payload.timestamp}] [WARN] ${payload.message}`, payload);
  },

  error: (message, error, meta = {}) => {
    const payload = formatPayload('ERROR', message, {
      ...meta,
      errorName: error?.name,
      errorMessage: error?.message,
      stack: !IS_PROD ? error?.stack : undefined
    });
    console.error(`[${payload.timestamp}] [ERROR] ${payload.message}`, payload);
  }
};

export default logger;
