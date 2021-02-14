const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { User, sequelize } = require('../models')
const redis = require('../config/redis.js')
const { success: successMsgs } = require('../docs/messages.json')


module.exports = {
  async signIn(req, res, next) {
    try {
      const { email, password } = req.body
      const result = await sequelize.query(`SELECT * FROM Users WHERE BINARY Users.email=:email LIMIT 1`, { replacements: { email }, type: sequelize.QueryTypes.SELECT })
      const user = result[0]
      if (!user) return res.status(403).json({ status: 'error', message: 'The email hasn\'t been registered' })
      if (!bcrypt.compareSync(password, user.password)) return res.status(403).json({ status: 'error', message: 'Wrong email or password.' })

      const payload = {
        id: user.id,
        name: user.name
      }
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' })
      res.json({ status: 'success', token })
    } catch (error) {
      next(error)
    }
  },
  async signOut(req, res, next) {
    const token = req.headers.authorization.split(' ')[1]
    jwt.verify(token, process.env.JWT_SECRET, async (error, payload) => {
      if (error) return next(error)
      const { iat, exp } = payload
      try {
        await redis.setAsync(token, exp, 'EX', exp - iat)
      } catch (error) {
        next(error)
      }
      return res.json({ status: 'success', message: successMsgs.general })
    })
  }
}