if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const router = require('./routes')
const passport = require('./config/passport.js')
const { error: errMsgs } = require('./docs/messages.json')

app.use(bodyParser.urlencoded({ extended: true }))
app.use(passport.initialize())

app.get('/', (req, res) => res.send('This is invoice recorder API backend server.'))
app.use('/api', router)
app.use((error, req, res, next) => {
  console.log(error)
  for (let code in errMsgs) {
    if (!parseInt(code)) continue
    if (errMsgs[code][error.message]) return res.status(Number(code)).json({ status: 'error', message: errMsgs[code][error.message] })
  }
  res.status(500).json({ status: 'error', message: 'Unexpected error. Please try again later' })
})
app.listen(process.env.PORT, () => console.log(`App is listening on ${process.env.BASE_URL}`))

module.exports = app