const sinon = require('sinon')
const chai = require('chai')
const should = chai.should()
const request = require('supertest')
const app = require('../app.js')
const { User, Tag } = require('../models')
const passport = require('../config/passport.js')
const helpers = require('../modules/_helpers.js')
const msgs = require('../docs/messages.json')
const { truncateTables } = require('../modules/models.js')

describe('# tag request', () => {
  describe('# POST /tags ', () => {
    before(async () => {
      truncateTables(User, Tag)
      //stub log in
      await User.create({ name: 'user1', email: 'user1@example.com', password: '12345678' })
      this.authenticate = sinon.stub(passport, 'authenticate').callsFake(() => (req, res, next) => next())
      this.getUser = sinon.stub(helpers, 'getUser').returns({ id: 1, name: 'user1', email: 'user1@example.com' })
    })

    it(' - create tag', (done) => {
      request(app)
        .post('/api/tags')
        .send('name=A')
        .expect(200)
        .end((error, res) => {
          if (error) return done(error)
          Tag.findOne({ where: { name: 'A', UserId: 1 }, raw: true })
            .then(tag => {
              tag.should.exist
              done()
            }).catch(error => done(error))
        })
    })

    after(async () => {
      truncateTables(User, Tag)
      this.authenticate.restore()
      this.getUser.restore()
    })
  })
  describe('# GET /tags ', () => {
    before(async () => {
      truncateTables(User, Tag)
      //stub log in
      await User.create({ name: 'user1', email: 'user1@example.com', password: '12345678' })
      this.authenticate = sinon.stub(passport, 'authenticate').callsFake(() => (req, res, next) => next())
      this.getUser = sinon.stub(helpers, 'getUser').returns({ id: 1, name: 'user1', email: 'user1@example.com' })

      await User.create({ name: 'user2', email: 'user2@example.com', password: '12345678' })
      await Tag.bulkCreate([{ UserId: 1, name: 'A' }, { UserId: 1, name: 'B' }, { UserId: 2, name: 'B' }])
    })

    it(' - get one\'s all tags', (done) => {
      request(app)
        .get('/api/tags')
        .expect(200)
        .end((error, res) => {
          if (error) return done(error)
          res.body.should.have.lengthOf(2)
          done()
        })
    })

    after(async () => {
      truncateTables(User, Tag)
      this.authenticate.restore()
      this.getUser.restore()
    })
  })
  describe('# PUT /tags/:tagId ', () => {
    before(async () => {
      truncateTables(User, Tag)
      //stub log in
      await User.create({ name: 'user1', email: 'user1@example.com', password: '12345678' })
      this.authenticate = sinon.stub(passport, 'authenticate').callsFake(() => (req, res, next) => next())
      this.getUser = sinon.stub(helpers, 'getUser').returns({ id: 1, name: 'user1', email: 'user1@example.com' })

      await User.create({ name: 'user2', email: 'user2@example.com', password: '12345678' })
      await Tag.bulkCreate([{ UserId: 1, name: 'A' }, { UserId: 1, name: 'B' }, { UserId: 2, name: 'B' }])
    })

    it(' - edit tag', (done) => {
      request(app)
        .put('/api/tags/1')
        .send('name=change')
        .expect(200)
        .end((error, res) => {
          if (error) return done(error)
          Tag.findAll({ where: { UserId: 1 }, raw: true, attributes: ['name'] })
            .then(tags => {
              tags.should.not.deep.include({ name: 'A' })
              tags.should.deep.include({ name: 'change' })
              done()
            }).catch(error => done(error))
        })
    })

    after(async () => {
      truncateTables(User, Tag)
      this.authenticate.restore()
      this.getUser.restore()
    })
  })
  describe('# DELETE /tags/:tagId ', () => {
    before(async () => {
      truncateTables(User, Tag)
      //stub log in
      await User.create({ name: 'user1', email: 'user1@example.com', password: '12345678' })
      this.authenticate = sinon.stub(passport, 'authenticate').callsFake(() => (req, res, next) => next())
      this.getUser = sinon.stub(helpers, 'getUser').returns({ id: 1, name: 'user1', email: 'user1@example.com' })

      await User.create({ name: 'user2', email: 'user2@example.com', password: '12345678' })
      await Tag.bulkCreate([{ UserId: 1, name: 'A' }, { UserId: 1, name: 'B' }, { UserId: 2, name: 'B' }])
    })

    it(' - delete tag', (done) => {
      request(app)
        .delete('/api/tags/1')
        .expect(200)
        .end((error, res) => {
          if (error) return done(error)
          Tag.findAll({ where: { name: 'A', UserId: 1 }, raw: true })
            .then(tag => {
              tag.should.have.lengthOf(0)
              done()
            }).catch(error => done(error))
        })
    })

    after(async () => {
      truncateTables(User, Tag)
      this.authenticate.restore()
      this.getUser.restore()
    })
  })
})