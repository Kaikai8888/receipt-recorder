if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const router = require('./routes')

app.use(bodyParser.urlencoded({ extended: true }))
app.use((error, req, res, next) => {
  console.log(error)
  res.status(500).json({ status: 'error', message: 'Unexpected error. Please try again later' })
})
app.use(router)
app.listen(process.env.PORT, () => console.log(`App is listening on ${process.env.BASE_URL}`))