const logger = require('../utils/logger');

function errorHandler(err, req, res, next) {
  logger.error('Unhandled error', { 
    message: err.message, 
    stack: err.stack 
  });

  res.status(500).json({
    error: 'An unexpected error occurred',
    message: err.message
  });
}

module.exports = errorHandler;