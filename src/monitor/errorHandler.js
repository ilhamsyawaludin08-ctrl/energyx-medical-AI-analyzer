require('dotenv').config();
const logger = require('../logger');
const notifyTelegram = require('../notifier/telegram');

const ENV_MODE = process.env.NODE_ENV || 'development';

const handleError = async (level, errorDetail) => {
  let message;
  let messageTelegram;
  if (typeof errorDetail === 'object') {
    message =
      `[${level.toUpperCase()}] [${ENV_MODE.toUpperCase()}]\n` +
      `Type: ${errorDetail.type}\n` +
      `Message: ${errorDetail.message}\n` +
      (errorDetail.stack ? `Stack:\n${errorDetail.stack}` : '');
    messageTelegram =
      `[${level.toUpperCase()}] [${ENV_MODE.toUpperCase()}]\n` +
      `Type: ${errorDetail.type}\n` +
      `Message: ${errorDetail.message}`;
  } else {
    message = `[${level.toUpperCase()}]\nMessage: ${errorDetail}`;
    messageTelegram = `[${level.toUpperCase()}]\nMessage: ${errorDetail}`;
  }
  logger.log({ level, message });
  if (['error', 'critical', 'warn'].includes(level)) {
    await notifyTelegram(messageTelegram);
  }
};

module.exports = handleError;
