const { body, validationResult } = require('express-validator')

const signinCheck = async (req, res, next) => {
  try {
    await body('email').isEmail().withMessage('Invalid email format').run(req)
    await body('password').isLength({ min: 8, max: 12 }).withMessage('Invalid password: password length should be between 8 to 12 characters.').run(req)
    const errorResults = validationResult(req)
    if (errorResults.isEmpty()) return next()
    const errors = errorResults.errors.map(error => error.msg)
    return res.status(400).json({ status: 'error', message: errors })
  } catch (error) {
    next(error)
  }
}


module.exports = {
  signinCheck,
}