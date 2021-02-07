if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const router = require('./routes')
const passport = require('./config/passport.js')

app.use(bodyParser.urlencoded({ extended: true }))
app.use(passport.initialize())
app.use((error, req, res, next) => {
  console.log(error)
  res.status(500).json({ status: 'error', message: 'Unexpected error. Please try again later' })
})
app.use('/api', router)
router.get('/', (req, res) => res.send('This is invoice recorder API backend server.'))
app.listen(process.env.PORT, () => console.log(`App is listening on ${process.env.BASE_URL}`))