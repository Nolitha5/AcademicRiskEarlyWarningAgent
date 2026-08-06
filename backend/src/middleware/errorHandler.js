/**
 * Centralised error handler – must be the last middleware registered.
 */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  console.error('[ERROR]', err)

  const status  = err.status ?? 500
  const message = err.message ?? 'Internal server error'

  res.status(status).json({ error: message, ...(process.env.NODE_ENV === 'development' && { stack: err.stack }) })
}
