const { body, validationResult } = require('express-validator')

const signinCheck = async (req, res, next) => {
  try {
    await body('email').isEmail().withMessage('Invalid email format').run(req)
    await body('password').isLength({ min: 8, max: 12 }).withMessage('Invalid password: password length should be between 8 to 12 characters.').run(req)
    return validationResultCheck(req, res, next)
  } catch (error) {
    next(error)
  }
}

const tagCheck = async (req, res, next) => {
  try {
    await body('name').trim().notEmpty().withMessage('Name field is empty.').run(req)
    return validationResultCheck(req, res, next)
  } catch (error) {
    next(error)
  }
}

function validationResultCheck(req, res, next) {
  const errorResults = validationResult(req)
  if (errorResults.isEmpty()) return next()
  const errors = errorResults.errors.map(error => error.msg)
  return res.status(400).json({ status: 'error', message: errors })
}


module.exports = {
  signinCheck,
  tagCheck
}