const express = require('express')
const router = express.Router()
const passport = require('../config/passport.js')
const userController = require('../controllers/userController.js')
const tagController = require('../controllers/tagController.js')
const { signinCheck, tagCheck, paramsCheck } = require('../middlewares/validator.js')
const authenticate = passport.authenticate('jwt', { session: false })

//all path starts with prefix '/api', which has already been set in app.js file
router.post('/signin', signinCheck, userController.signIn)
router.post('/signout', authenticate, userController.signOut)

router.get('/tags', authenticate, tagController.getTags)
router.get('/tags/:id', authenticate, paramsCheck, tagController.getTag)
router.post('/tags', authenticate, tagCheck, tagController.createTag)
router.put('/tags/:id', authenticate, paramsCheck, tagCheck, tagController.editTag)
router.delete('/tags/:id', authenticate, paramsCheck, tagController.deleteTag)

module.exports = router

