const express = require('express')
const multer = require('multer')
const upload = multer({ dest: 'temp/' })
const router = express.Router()
const userController = require('../controllers/userController.js')
const tagController = require('../controllers/tagController.js')
const receiptController = require('../controllers/receiptController.js')
const taggingController = require('../controllers/taggingController.js')
const { signinCheck, tagCheck, idCheck } = require('../middlewares/validator.js')
const passport = require('../config/passport.js')

function authenticate(req, res, next) {
  return passport.authenticate('jwt', { session: false })(req, res, next)
}

//all path starts with prefix '/api', which has already been set in app.js file
router.post('/signin', signinCheck, userController.signIn)
router.post('/signout', authenticate, userController.signOut)

router.get('/tags', authenticate, tagController.getTags)
router.get('/tags/:id', authenticate, idCheck(), tagController.getTag)
router.post('/tags', authenticate, tagCheck, tagController.createTag)
router.put('/tags/:id', authenticate, idCheck(), tagCheck, tagController.editTag)
router.delete('/tags/:id', authenticate, idCheck(), tagController.deleteTag)

router.get('/receipts', authenticate, idCheck('query', 'tagId'), receiptController.getReceipts)
router.post('/receipts', authenticate, upload.single('receipt'), receiptController.createReceipt)

router.post('/tagging', authenticate, idCheck('body', 'ReceiptId'), idCheck('body', 'TagId'), taggingController.addTag)
router.delete('/tagging/:id', authenticate, idCheck(), taggingController.removeTag)


module.exports = router

