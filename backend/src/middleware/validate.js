/**
 * Express middleware factory for Joi schema validation.
 * Usage: router.post('/', validate(schema), controller)
 */
export function validate(schema) {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false })
    if (error) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.details.map(d => d.message),
      })
    }
    next()
  }
}
