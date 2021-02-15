const sinon = require('sinon')
const chai = require('chai')
const should = chai.should()
const request = require('supertest')
const app = require('../app.js')
const { User, Receipt, Tag, Tagging, Store } = require('../models')
const passport = require('../config/passport.js')
const helpers = require('../modules/_helpers.js')
const msgs = require('../docs/messages.json')
const { truncateTables } = require('../modules/models.js')

const checkTagging = (done, length = 1, TagId = 1, ReceiptId = 1) => {
  return Tagging.findAll({ where: { TagId, ReceiptId }, raw: true }).then(tagging => {
    tagging.should.have.lengthOf(length)
    done()
  }).catch(error => done(error))
}

describe('# tagging request', () => {
  describe('# POST /tagging ', () => {
    before(async () => {
      truncateTables(User, Receipt, Tag, Tagging)
      //stub log in
      await User.create({ name: 'user1', email: 'user1@example.com', password: '12345678' })
      this.authenticate = sinon.stub(passport, 'authenticate').callsFake(() => (req, res, next) => next())
      this.getUser = sinon.stub(helpers, 'getUser').returns({ id: 1, name: 'user1', email: 'user1@example.com' })
      //create data
      await User.create({ name: 'user2', email: 'user2@example.com', password: '12345678' })
      await Store.create({ name: 'Hello World' })
      await Tag.bulkCreate([{ id: 1, name: 'A', UserId: 1 }, { id: 2, name: 'B', UserId: 2 }])
      await Receipt.bulkCreate([1, 2].map((num, i) => ({
        id: num,
        UserId: num,
        StoreId: 1,
        receiptNo: num,
        payment: 'CASH',
        date: new Date()
      })))
    })

    it(' - tagging', (done) => {
      request(app)
        .post('/api/tagging')
        .send('TagId=1&&ReceiptId=1')
        .expect(200)
        .end((error, res) => {
          if (error) return done(error)
          res.body.should.be.an('object')
          res.body.message.should.equal(msgs.success.general)
          checkTagging(done)
        })
    })

    it(' - avoid duplicated tagging records creation', (done) => {
      request(app)
        .post('/api/tagging')
        .send('TagId=1&&ReceiptId=1')
        .expect(200)
        .end((error, res) => {
          if (error) return done(error)
          res.body.should.be.an('object')
          res.body.message.should.equal(msgs.success.already)
          checkTagging(done)
        })
    })

    it(' - block invalid id: not integer', (done) => {
      request(app)
        .post('/api/tagging')
        .send('TagId=##&&ReceiptId=1')
        .expect(400)
        .end((error, res) => {
          if (error) return done(error)
          res.body.should.be.an('object')
          res.body.message.should.equal(msgs.error[400].invalidId)
          checkTagging(done)
        })
    })

    it(' - block invalid id: blank', (done) => {
      request(app)
        .post('/api/tagging')
        .send('TagId=1&&ReceiptId= ')
        .expect(400)
        .end((error, res) => {
          if (error) return done(error)
          res.body.should.be.an('object')
          res.body.message.should.equal(msgs.error[400].invalidId)

          checkTagging(done)
        })
    })


    it(' - can\'t access other user\'s tag', (done) => {
      request(app)
        .post('/api/tagging')
        .send('TagId=2&&ReceiptId=1')
        .expect(404)
        .end((error, res) => {
          if (error) return done(error)
          res.body.should.be.an('object')
          res.body.message.should.equal(msgs.error[404].notFound)
          checkTagging(done)
        })
    })

    it(' - can\'t tag other user\'s receipt', (done) => {
      request(app)
        .post('/api/tagging')
        .send('TagId=1&&ReceiptId=2')
        .expect(404)
        .end((error, res) => {
          if (error) return done(error)
          res.body.should.be.an('object')
          res.body.message.should.equal(msgs.error[404].notFound)
          checkTagging(done)
        })
    })

    after(async () => {
      truncateTables(User, Receipt, Tag, Tagging)
      this.authenticate.restore()
      this.getUser.restore()
    })
  })
  describe('# DELETE /tagging ', () => {
    before(async () => {
      truncateTables(User, Receipt, Tag, Tagging)
      //stub log in
      await User.create({ name: 'user1', email: 'user1@example.com', password: '12345678' })
      this.authenticate = sinon.stub(passport, 'authenticate').callsFake(() => (req, res, next) => next())
      this.getUser = sinon.stub(helpers, 'getUser').returns({ id: 1, name: 'user1', email: 'user1@example.com' })
      //create data
      await User.create({ name: 'user2', email: 'user2@example.com', password: '12345678' })
      await Store.create({ name: 'Hello World' })
      await Tag.bulkCreate([{ id: 1, name: 'A', UserId: 1 }, { id: 2, name: 'B', UserId: 2 }])
      await Receipt.bulkCreate([1, 2].map((num, i) => ({
        id: num,
        UserId: num,
        StoreId: 1,
        receiptNo: num,
        payment: 'CASH',
        date: new Date()
      })))
      await Tagging.bulkCreate([{ ReceiptId: 1, TagId: 1 }, { ReceiptId: 2, TagId: 2 }])
    })

    it(' - untag', (done) => {
      request(app)
        .delete('/api/tagging')
        .send('TagId=1&&ReceiptId=1')
        .expect(200)
        .end((error, res) => {
          if (error) return done(error)
          res.body.should.be.an('object')
          res.body.message.should.equal(msgs.success.general)
          checkTagging(done)
        })
    })

    it(' - tagging relationship not exist', (done) => {
      request(app)
        .delete('/api/tagging')
        .send('TagId=1&&ReceiptId=1')
        .expect(404, { status: 'error', message: msgs.error[404].notFound }, done)
    })

    it(' - block invalid id: not integer', (done) => {
      request(app)
        .delete('/api/tagging')
        .send('TagId=##&&ReceiptId=1')
        .expect(400, { status: 'error', message: msgs.error[400].invalidId }, done)
    })

    it(' - can\'t delete other user\'s tagging data', (done) => {
      request(app)
        .delete('/api/tagging')
        .send('TagId=2&&ReceiptId=2')
        .expect(404)
        .end((error, res) => {
          if (error) return done(error)
          res.body.should.deep.equal({ status: 'error', message: msgs.error[404].notFound })
          checkTagging(done, 1, 2, 2)
        })
    })

    after(async () => {
      truncateTables(User, Receipt, Tag, Tagging)
      this.authenticate.restore()
      this.getUser.restore()
    })
  })
})