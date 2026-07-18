require('dotenv').config();
const express = require('express');
const { sequelize } = require('./src/config/database');
const Routes = require('./src/routes');
const cors = require('cors');
const handleError = require('./src/monitor/errorHandler');

const app = express();
app.use(cors())
app.use(express.json());

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    handleError('error', {
      type: err.name,
      message: err.message,
      stack: err.stack
    });
    return res.status(400).json({
      status: 400,
      error: {
        type: err.name,
        message: 'Invalid JSON format'
      }
    });
  }
  next(err);
});

app.use('/api', Routes);

const PORT = process.env.PORT || 3000;

sequelize.sync({ alter: false })
    .then(() => console.log('Database connected'))
    .catch((err) => console.error('Database connection failed:', err));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Optional: Global error catch
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  handleError('error', {
      type: err.name,
      message: err.message,
      stack: err.stack
    });
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  handleError('error', `Unhandled Rejection: ${reason}`);
});
