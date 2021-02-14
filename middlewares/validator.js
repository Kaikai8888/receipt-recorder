const { body, check, validationResult } = require('express-validator')

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

const idCheck = (paramType = 'params', field = 'id') => {
  return async (req, res, next) => {
    try {
      if (!req[paramType]) throw new Error('Target validation field not found')
      if (req[paramType][field]) await check(field).custom((id) => parseInt(id)).withMessage(`Invalid ${field}.`).run(req)
      return validationResultCheck(req, res, next)
    } catch (error) {
      next(error)
    }
  }
}

function validationResultCheck(req, res, next) {
  const errorResults = validationResult(req)
  if (errorResults.isEmpty()) return next()
  const errorMsgs = errorResults.errors.map(error => error.msg)
  return res.status(400).json({
    status: 'error',
    message: errorMsgs.length === 1 ? errorMsgs[0] : errorMsgs
  })
}


module.exports = {
  signinCheck,
  tagCheck,
  idCheck
}