const express = require('express')
const router = express.Router()
const passport = require('../config/passport.js')
const userController = require('../controllers/userController.js')
const tagController = require('../controllers/tagController.js')
const { signinCheck } = require('../middlewares/validator.js')
const authenticator = passport.authenticate('jwt', { session: false })

//all path starts with prefix '/api', which has already been set in app.js file
router.post('/signin', signinCheck, userController.signIn)
router.post('/signout', authenticator, userController.signOut)

router.get('/tags', authenticator, tagController.getTags)
router.get('/tags/:id', authenticator, tagController.getTag)


module.exports = router

