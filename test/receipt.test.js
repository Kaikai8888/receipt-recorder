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
        .attach('receipt', './test/test_receipts/sample_receipt_2.txt')
        .end((error, res) => {
          if (error) return done(error)
          expect(res.body).to.be.an('object')
          res.body.message.should.equal('ok')

          Receipt.findByPk(1, {
            include: [
              { model: Product, as: 'Products' },
              { model: Store }
            ]
          }).then(r => {
            const receipt = r.dataValues
            receipt.should.nested.include({ receiptNo: 92737, tender: '50.00', change: '7.30' })
            receipt.Products[1].should.nested.include({ productNo: 7622210410474, name: 'Cadbury Dairy Milk 165g' })
            receipt.Products[1].Purchase.should.nested.include({ ProductId: 2, ReceiptId: 1, quantity: 2, price: '3.80' })
            receipt.Store.should.nested.include({
              name: 'Bob\'s Store', tel: '0123456789', gstReg: '0123456789'
            })
            done()
          }).catch(error => done(error))
        })
    })

    after(async () => {
      this.authenticate.restore()
      this.getUser.restore()
      truncateTables(User, Receipt, Product, Purchase, Store)
    })
  })
})


