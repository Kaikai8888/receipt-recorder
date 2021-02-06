const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { User } = require('../models')

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
  }
}