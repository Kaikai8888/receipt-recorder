const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController.js')
const { signinCheck } = require('../middlewares/validator.js')

router.get('/', (req, res) => res.send('This is invoice recorder API backend server.'))
router.post('/api/signin', signinCheck, userController.signIn)
router.post('/api/signOut', userController.signOut)

module.exports = router