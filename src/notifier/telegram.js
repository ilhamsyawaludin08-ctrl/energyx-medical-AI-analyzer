const TelegramBot = require('node-telegram-bot-api');
const { telegram } = require('../config/config');

const bot = new TelegramBot(telegram.token, { polling: false });

const notifyTelegram = async (message) => {
  try {
    await bot.sendMessage(telegram.chatId, `🚨 *Warning System Alert!*\n\n${message}`);
  } catch (err) {
    console.error('Failed to send Telegram message:', err.message);
  }
};

module.exports = notifyTelegram;
