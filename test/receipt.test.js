const sinon = require('sinon')
const chai = require('chai')
const expect = chai.expect
const should = chai.should()
const request = require('supertest')
const app = require('../app.js')
const { User, Receipt, Product, Purchase, Store } = require('../models')
const passport = require('../config/passport.js')
const helpers = require('../modules/_helpers.js')
const msgs = require('../docs/messages.json')
const truncateTables = async (...models) => {
  await Promise.all(models.map(model => model.destroy({ where: {}, truncate: true })))
}

describe('# receipt request', () => {
  describe('# POST /receipts ', () => {
    before(async () => {
      truncateTables(User, Receipt, Product, Purchase, Store)

      await User.create({ name: 'user1', email: 'user1@example.com', password: '12345678' })

      this.authenticate = sinon.stub(passport, 'authenticate').callsFake(() => (req, res, next) => next())
      this.getUser = sinon.stub(helpers, 'getUser').returns({ id: 1, name: 'user1', email: 'user1@example.com' })
    })

    it(' - upload receipt', (done) => {
      request(app)
        .post('/api/receipts')
        .attach('receipt', './docs/quiz_sample_receipts/sample_receipt_2.txt')
        .end((error, res) => {
          if (error) return done(error)
          expect(res.body).to.be.an('object')
          res.body.message.should.equal('ok')
          done()
        })
    })
    after(async () => {
      this.authenticate.restore()
      this.getUser.restore()
      truncateTables(User, Receipt, Product, Purchase, Store)
    })
  })
})
