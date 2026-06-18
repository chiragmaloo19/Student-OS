/**
 * errorHandler.js — global Express error handler for all unhandled errors
 * Catches errors thrown in route handlers (including async via express-async-errors)
 * @param {Error} err
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function errorHandler(err, req, res, next) {
  // Log the error stack in development
  if (process.env.NODE_ENV !== 'production') {
    console.error('\x1b[31m[ERROR]\x1b[0m', err.stack || err.message)
  }

  const statusCode = err.statusCode || err.status || 500

  res.status(statusCode).json({
    status:  'error',
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  })
}

module.exports = errorHandler
