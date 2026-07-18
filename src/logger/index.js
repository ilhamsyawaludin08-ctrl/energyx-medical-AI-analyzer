const winston = require('winston');
const stackTrace = require('stack-trace');
const { levels, colors } = require('./levels');
require('winston-daily-rotate-file');
const path = require('path');
const fs = require('fs');

winston.addColors(colors);

// Pastikan folder logs tersedia
const logDir = path.join(__dirname, '..', 'logs');

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Custom formatter untuk log JSON dengan file, line, function
const stackInfoFormat = winston.format((info) => {
  const trace = stackTrace.get();

  // Frame ke-2 biasanya lokasi log dipanggil
  const frame = trace[10] || trace[2] || trace[0];

  info.filename = frame?.getFileName()
    ? path.basename(frame.getFileName())
    : null;

  info.function = frame?.getFunctionName() || null;
  info.line = frame?.getLineNumber() || null;
  info.timestamp = new Date().toISOString();

  return info;
});

// Transport untuk log file harian (JSON format)
const dailyRotateFileTransport = new winston.transports.DailyRotateFile({
  dirname: logDir,
  filename: 'log-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: false,
  maxSize: '10m',
  maxFiles: '14d',
  level: 'info',
  format: winston.format.combine(
    stackInfoFormat(),
    winston.format.json()
  ),
});

// Transport untuk console (format warna & stack)
const consoleTransport = new winston.transports.Console({
  format: winston.format.combine(
    winston.format.colorize(),
    stackInfoFormat(),
    winston.format.printf(({ timestamp, level, message, filename, line, function: fn }) => {
      return `[${timestamp}] ${level}: ${message} (${filename}:${line}${fn ? ` in ${fn}` : ''})`;
    })
  ),
});

const logger = winston.createLogger({
  levels,
  level: 'info',
  transports: [
    consoleTransport,
    dailyRotateFileTransport
  ],
});

module.exports = logger;
