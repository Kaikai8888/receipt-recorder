const passport = require('passport')
const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const { User } = require('../models')
const redis = require('./redis.js')
const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
  passReqToCallback: true
}

passport.use(new JwtStrategy(opts, async (req, payload, done) => {
  try {
    const token = req.headers.authorization.split(' ')[1]
    const exist = await redis.existsAsync(token)
    if (exist) return done(null, false)
    const { id } = payload
    const user = await User.findByPk(id, { attributes: { excluded: 'password' } })
    if (!user) return done(null, false)
    return done(null, user.toJSON())
  } catch (error) {
    done(error, false)
  }
}))

module.exports = passport