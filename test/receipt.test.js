const sinon = require('sinon')
const chai = require('chai')
const expect = chai.expect
const should = chai.should()
const request = require('supertest')
const app = require('../app.js')
const { User, Receipt, Product, Purchase, Store, Tag, Tagging } = require('../models')
const allModel = [User, Receipt, Product, Purchase, Store, Tag, Tagging]
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
        .expect(200)
        .end((error, res) => {
          if (error) return done(error)
          expect(res.body).to.be.an('object')
          res.body.message.should.equal('ok')

          Receipt.findByPk(1, {
            include: [
              { model: Product, as: 'Products', order: ['productNo', 'ASC'] },
              { model: Store }
            ]
          }).then(r => {
            const receipt = r.dataValues
            receipt.should.nested.include({ receiptNo: 92737, tender: '50.00', change: '7.30' })
            receipt.Products[1].should.nested.include({ productNo: 7622210410474, name: 'Cadbury Dairy Milk 165g' })
            receipt.Products[1].Purchase.should.nested.include({ quantity: 2, price: '3.80' })
            receipt.Store.should.nested.include({
              id: 1, name: 'Bob\'s Store', tel: '0123456789', gstReg: '0123456789'
            })
            done()
          }).catch(error => done(error))
        })
    })

    it(' - upload existing receipt (with the same receipt id)', (done) => {
      request(app)
        .post('/api/receipts')
        .attach('receipt', './test/test_receipts/sample_receipt_2.txt')
        .expect(200)
        .end((error, res) => {
          if (error) return done(error)
          expect(res.body).to.be.an('object')
          res.body.message.should.equal(msgs.success.already)
          Receipt.findAll({ raw: true }).then(r => {
            r.length.should.equal(1)
            done()
          }).catch(error => done(error))
        })
    })

    it(' - products or store already exist: find or update instead of create new ones ', (done) => {
      request(app)
        .post('/api/receipts')
        .attach('receipt', './test/test_receipts/products_store_already_exist.txt')
        .then((error, res) => {
          Receipt.findAll({
            include: [
              {
                model: Purchase,
                attributes: ['ProductId'],
                include: { model: Product, attributes: ['name', 'productNo'], order: ['productNo', 'ASC'] }
              },
              { model: Store }
            ],
          }).then(r => {
            const receipts = r.map(r => r.toJSON())
            receipts[0].Purchases.should.deep.equal(receipts[1].Purchases)
            receipts[0].Store.should.deep.equal(receipts[1].Store)
            receipts[1].Purchases.find(p => p.Product.productNo === 7622210410474).Product.name.should.equal('Cadbury Dairy Milk 3000g')
            receipts[1].Store.should.include({ name: 'Amy\'s Store' })
            done()
          }).catch(error => done(error))
        })
    })

    it(' - file missing', (done) => {
      request(app)
        .post('/api/receipts')
        .expect(400, { status: 'error', message: msgs.error[400].fileMissing }, done)
    })

    it(' - Unexpected receipt format: missing productNo', (done) => {
      request(app)
        .post('/api/receipts')
        .attach('receipt', './test/test_receipts/format-err_productNo.txt')
        .expect(400, { status: 'error', message: msgs.error[400].format }, done)
    })

    it(' - Wrong payment type', (done) => {
      request(app)
        .post('/api/receipts')
        .attach('receipt', './test/test_receipts/payment_err.txt')
        .expect(400, { status: 'error', message: msgs.error[400].payment }, done)
    })

    after(async () => {
      truncateTables(User, Receipt, Product, Purchase, Store)
      this.authenticate.restore()
      this.getUser.restore()
    })
  })

  describe('# GET /receipts', () => {
    before(async () => {
      try {
        truncateTables(...allModel)
        // stub log in
        await User.create({ name: 'user1', email: 'user1@example.com', password: '12345678' })
        this.authenticate = sinon.stub(passport, 'authenticate').callsFake(() => (req, res, next) => next())
        this.getUser = sinon.stub(helpers, 'getUser').returns({ id: 1, name: 'user1', email: 'user1@example.com' })

        // create data
        await User.create({ name: 'user2', email: 'user2@example.com', password: '12345678' })
        await Product.bulkCreate([7622210400291, 168168168].map((num, i) => ({ id: i + 1, productNo: num, name: num.toString(16), StoreId: 1 })))
        await Store.create({ name: 'Hello World' })
        await Tag.bulkCreate([{ id: 1, name: 'A', UserId: 1 }, { id: 2, name: 'B', UserId: 2 }])
        await Receipt.bulkCreate([762221, 16816].map((num, i) => ({
          id: i + 1,
          UserId: 1,
          StoreId: 1,
          receiptNo: num,
          payment: 'CASH',
          date: new Date(),
          tender: 6,
          change: 0.84
        })))
        await Purchase.bulkCreate([1, 2].reduce((data, ReceiptId) => {
          data.push({ ReceiptId, ProductId: 1, quantity: 3, price: 0.6 })
          data.push({ ReceiptId, ProductId: 2, quantity: 2, price: 1.68 })
          return data
        }, []))
        await Tagging.create({ ReceiptId: 1, TagId: 1 })
      } catch (error) { console.log(error) }
    })

    it(' - get all receipts', (done) => {
      request(app)
        .get('/api/receipts')
        .expect(200)
        .end((error, res) => {
          if (error) return done(error)
          res.body.should.be.an('array')
          res.body.length.should.equal(2)

          //check included models
          res.body[0].Products.length.should.equal(2)
          res.body[0].Store.should.include({ name: 'Hello World' })
          //check if stringified decimal number has been transformed back to number
          res.body[0].tender.should.equal(6)
          res.body[0].change.should.equal(0.84)
          //check calculation, especially check if precision issue of float number calculation has been solved (totalAmount, subtotal)
          res.body[0].Products.find(p => p.id === 1).should.include({ quantity: 3, price: 0.6, subtotal: 1.8 })
          res.body[0].Products.find(p => p.id === 2).should.include({ quantity: 2, price: 1.68, subtotal: 3.36 })
          res.body[0].should.include({ totalAmount: 5.16, items: 2, qty: 5 })

          done()
        })
    })

    it(' - filter by tagId', (done) => {
      request(app)
        .get('/api/receipts?tagId=1')
        .expect(200)
        .end((error, res) => {
          if (error) return done(error)
          res.body.should.be.an('array')
          res.body.length.should.equal(1)
          res.body[0].receiptNo.should.equal(762221)
          done()
        })
    })

    it(' - block invalid tagId filtering', (done) => {
      request(app)
        .get('/api/receipts')
        .query({ tagId: '###' })
        .expect(400)
        .end((error, res) => {
          if (error) return done(error)
          res.body.should.be.an('object')
          done()
        })
    })

    it(' - not allowed to filter by other user\'s tag', (done) => {
      request(app)
        .get('/api/receipts?tagId=2')
        .expect(404)
        .end((error, res) => {
          if (error) return done(error)
          res.body.should.be.an('object')
          done()
        })
    })

    after(async () => {
      truncateTables(...allModel)
      this.authenticate.restore()
      this.getUser.restore()
    })
  })
})