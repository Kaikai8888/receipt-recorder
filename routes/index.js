const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController.js')


router.get('/', (req, res) => res.send('This is invoice recorder API backend server.'))
router.post('/api/signin', userController.signIn)

module.exports = router