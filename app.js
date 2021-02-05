if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
const express = require('express')
const bodyParser = require('body-parser')
const app = express()

app.get('/', (req, res) => res.send('Hi'))

app.listen(process.env.PORT, () => console.log(`App is listening on ${process.env.BASE_URL}`))