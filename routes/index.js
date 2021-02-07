const express = require('express')
const router = express.Router()
const passport = require('../config/passport.js')
const userController = require('../controllers/userController.js')
const { signinCheck } = require('../middlewares/validator.js')
const { Tag } = require('../models')
const authenticator = passport.authenticate('jwt', { session: false })

//all path starts with prefix '/api', which has already been set in app.js file
router.get('/tags', authenticator, async (req, res) => {
  try {
    const UserId = req.user.id
    const tags = await Tag.findAll({ where: { UserId }, attributes: ['id', 'name'] })
    return res.json(tags)
  } catch (error) {
    next(error)
  }
})
router.post('/signin', signinCheck, userController.signIn)
router.post('/signout', authenticator, userController.signOut)

module.exports = router

