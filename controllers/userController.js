const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { User } = require('../models')
const redis = require('../config/redis.js')

module.exports = {
  async signIn(req, res, next) {
    try {
      const { email, password } = req.body
      const user = await User.findOne({ where: { email } })
      if (!user) return res.status(400).json({ status: 'error', message: 'The email hasn\'t been registered' })
      if (!bcrypt.compareSync(password, user.password)) return res.status(400).json({ status: 'error', message: 'Wrong email or password.' })

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
        await redis.setAsync(token, exp, 'EX', 10)
      } catch (error) {
        next(error)
      }
      return res.json({ status: 'success', message: 'Successfully sign out' })
    })

  }
}