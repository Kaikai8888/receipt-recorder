const sinon = require('sinon')
const chai = require('chai')
const should = chai.should()
const bcrypt = require('bcryptjs')
const request = require('supertest')
const app = require('../app.js')
const { User } = require('../models')
const msgs = require('../docs/messages.json')
const { truncateTables } = require('../modules/models.js')

describe('# signin and sign out', () => {
  let token

  describe('# POST /signin', () => {
    before(async () => {
      truncateTables(User)
      //stub log in
      const hashedPassword = bcrypt.hashSync('12345678', bcrypt.genSaltSync(10))
      await User.create({ name: 'user1', email: 'user1@example.com', password: hashedPassword })
    })

    it(' - successfully signin, and can pass authentication in GET /records route', (done) => {
      request(app)
        .post('/api/signin')
        .send('email=user1@example.com&password=12345678')
        .expect(200)
        .end((error, res) => {
          if (error) return done(error)
          res.body.token.should.exist
          token = res.body.token
          request(app)
            .get('/api/tags')
            .set('Authorization', 'Bearer ' + token)
            .expect(200, [], done)
        })
    })

    it(' - wrong email or password format', (done) => {
      request(app)
        .post('/api/signin')
        .send('email=user1&password=888')
        .expect(400, done)
    })

    it(' - email not registered', (done) => {
      request(app)
        .post('/api/signin')
        .send('email=user2@example.com&password=888888888')
        .expect(403, done)
    })

    it(' - wrong password should be blocked', (done) => {
      request(app)
        .post('/api/signin')
        .send('email=user1@example.com&password=888888888')
        .expect(403, done)
    })
  })
  describe('# POST /signout', () => {
    it(' - successfully signout and cannot access GET /records', (done) => {
      request(app)
        .post('/api/signout')
        .set('Authorization', 'Bearer ' + token)
        .expect(200)
        .end((error, res) => {
          if (error) return done(error)
          request(app)
            .get('/api/tags')
            .set('Authorization', 'Bearer ' + token)
            .expect(401, done)
        })
    })

    after(async () => {
      truncateTables(User)
    })
  })
})