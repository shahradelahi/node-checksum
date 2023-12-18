export default {
  error(...args: unknown[]) {
    console.error('error:', ...args);
  },
  info(...args: unknown[]) {
    console.info('notice:', ...args);
  },
  warn(...args: unknown[]) {
    console.warn('warn:', ...args);
  },
  log(...args: unknown[]) {
    console.log(...args);
  },
};
