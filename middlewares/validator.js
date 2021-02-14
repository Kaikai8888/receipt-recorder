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
  if (!req.body.name || !req.body.name.trim()) return next(new Error('nameMissing'))
  next()
}

const idCheck = (paramType = 'params', field = 'id') => {
  return (req, res, next) => {
    if (!req[paramType]) return next(new Error('Target validation field not found'))
    const id = parseFloat(req[paramType][field])
    if (!Number.isInteger(id)) return next(new Error('invalidId'))
    next()
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