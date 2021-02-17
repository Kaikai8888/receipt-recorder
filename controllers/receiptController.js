const { Receipt, Store, Product, Purchase, Tag } = require('../models')
const fs = require('fs')
const { success: successMsgs } = require('../docs/messages.json')
const { upsertOnFields } = require('../modules/models.js')
const { formatReceipt, parse } = require('../modules/receipts.js')
const helpers = require('../modules/_helpers')
const excludedCols = ['createdAt', 'updatedAt', 'StoreId', 'UserId']

module.exports = {
  createReceipt(req, res, next) {
    const { file } = req
    const UserId = helpers.getUser(req).id
    if (!file) next(new Error('fileMissing'))

    fs.readFile(file.path, async (error, data) => {
      try {
        if (error) next(error)
        const lines = data.toString().split('\r\n')
        const receipt = { UserId }

        // check if receipt already exists
        receipt.receiptNo = parse.receiptNo(lines[5])
        const exist = await Receipt.findOne({ where: receipt })
        if (exist) return res.json({ status: 'success', message: successMsgs.already })

        //parse data
        const store = parse.store(lines, 0)
        receipt.date = parse.date(lines[4])
        let { i, products, purchases } = parse.products(lines, 7)
        receipt.payment = parse.payment(lines[i + 1])
        parse.tender(lines[i + 2], receipt)

        //save to database
        const [{ id: StoreId }, _] = await upsertOnFields(Store, ['gstReg'], store)
        const { id: ReceiptId } = await Receipt.create({ ...receipt, StoreId })
        const results = await Promise.all(products.map(p => upsertOnFields(Product, ['productNo', 'StoreId'], { ...p, StoreId })))
        results.forEach(result => {
          const [product, _] = result
          purchases.some(purchase => {
            if (purchase.productNo !== product.dataValues.productNo) return false
            purchase.ProductId = product.dataValues.id
            purchase.ReceiptId = ReceiptId
            delete purchase.productNo
            return true
          })
        })
        await Purchase.bulkCreate(purchases)
        return res.json({ status: 'success', message: successMsgs.general })

      } catch (error) {
        next(error)
      }
    })
  },
  async getReceipts(req, res, next) {
    try {
      const UserId = helpers.getUser(req).id
      const TagId = parseInt(req.query.tagId)
      const receiptFilter = {
        include: [
          { model: Product, as: 'Products' },
          { model: Store, attributes: ['name', 'id'] },
        ],
        attributes: { exclude: excludedCols }
      }
      if (!TagId) {
        receipts = await Receipt.findAll({
          where: { UserId },
          ...receiptFilter
        })
      } else {
        receipts = await Tag.findOne({
          where: { id: TagId, UserId },
          include: {
            model: Receipt,
            as: 'TaggedReceipts',
            ...receiptFilter
          },
          attributes: []
        })
        if (!receipts) throw new Error('notFound')
        receipts = receipts.TaggedReceipts
      }

      const formattedReceipts = receipts.map(formatReceipt)
      return res.json(formattedReceipts)

    } catch (error) {
      next(error)
    }
  }
}




