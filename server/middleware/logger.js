/**
 * logger.js — logs every incoming HTTP request with method, path, and response time
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function logger(req, res, next) {
  const start = Date.now()

  res.on('finish', () => {
    const ms      = Date.now() - start
    const status  = res.statusCode
    const color   = status >= 500 ? '\x1b[31m' // red
                  : status >= 400 ? '\x1b[33m' // yellow
                  : status >= 300 ? '\x1b[36m' // cyan
                  : '\x1b[32m'                 // green
    const reset   = '\x1b[0m'

    console.log(
      `${color}${req.method.padEnd(7)}${reset} ${req.originalUrl.padEnd(40)} ${color}${status}${reset} ${ms}ms`
    )
  })

  next()
}

module.exports = logger
