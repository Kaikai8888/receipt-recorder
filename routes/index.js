const express = require('express')
const router = express.Router()
const passport = require('../config/passport.js')
const userController = require('../controllers/userController.js')
const { signinCheck } = require('../middlewares/validator.js')
const authenticator = passport.authenticate('jwt', { session: false })


router.get('/tags', authenticator, (req, res) => {
  res.json({ message: 'ok' })
})
router.post('/signin', signinCheck, userController.signIn)
router.post('/signout', authenticator, userController.signOut)

module.exports = router

