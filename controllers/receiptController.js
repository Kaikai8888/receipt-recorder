const { Receipt, Store, Product, Purchase } = require('../models')
const fs = require('fs')
const paymentTypes = require('../docs/payment_types.json')
const { success: successMsgs } = require('../docs/messages.json')

module.exports = {
  createReceipt(req, res, next) {
    const { file } = req
    const UserId = req.user.id
    fs.readFile(file.path, async (error, data) => {
      try {
        if (error) next(error)
        const lines = data.toString().split('\r\n')
        const receipt = { UserId }
        const purchases = []

        // block duplicate receipt upload
        receipt.id = parseInt(getAfterColon(lines[5]))
        if (!receipt.id) throw new Error('format')
        const duplicateReceipt = await Receipt.findByPk(receipt.id)
        if (duplicateReceipt) return res.json({ status: 'success', message: successMsgs.already })

        //parse store data
        const store = {
          name: lines[0].trim(),
          tel: getAfterColon(lines[1]),
          gstReg: getAfterColon(lines[2])
        }
        const [{ id: StoreId }, _] = await Store.findOrCreate({ where: store, raw: true, attributes: ['id'] })
        receipt.StoreId = StoreId

        //parse receipt date
        const [date, time] = lines[4].split(/\s+/).map(getAfterColon)
        const [day, month, year] = date.split('.')
        receipt.date = new Date(`${year}-${month}-${day}T${time}`)
        if (receipt.date.toString() === 'Invalid Date') throw new Error('format')

        //parse products and purchases data
        let i = 7
        while (lines[i].trim()) {
          //parse product info
          const productInfo = lines[i]
          const firstBlankIndex = productInfo.indexOf(' ')
          const product = {
            productNo: parseInt(productInfo.slice(0, firstBlankIndex))
          }
          if (!product.productNo) throw new Error('format')
          product.name = productInfo.slice(firstBlankIndex)
          const [{ id: ProductId }, _] = await Product.findOrCreate({ where: product })

          //parse purchase info
          const values = lines[i + 1].split(/\s+/)
          const quantity = parseFloat(values[0])
          const price = parseFloat(values[2])
          if (isNaN(quantity) || isNaN(price)) throw new Error('format')
          purchases.push({ ReceiptId: receipt.id, ProductId, quantity, price })
          //skip to next product
          i += 2
        }

        //parse receipt: payment
        receipt.payment = lines[i + 1].split(/\s+/)[0]
        if (!paymentTypes.includes(receipt.payment)) throw new Error('payment')
        //parse receipt: tender, change
        const regExp = new RegExp(/TENDER \d+\.?\d*\s+CHANGE \d+\.?\d*/)
        if (regExp.test(lines[i + 2])) {
          const values = lines[i + 2].trim().split(/\s+/)
          receipt.tender = parseFloat(values[1])
          receipt.change = parseFloat(values[3])
        }

        //save to database
        await Receipt.upsert(receipt)
        await Purchase.bulkCreate(purchases)

        const result = await Receipt.findByPk(receipt.id, { include: { model: Product, as: 'Products' } })
        return res.json({ status: 'success', message: successMsgs.general, receipt, store, purchases, result })

      } catch (error) {
        next(error)
      }
    })
  }
}

function getAfterColon(line) {
  return line.slice(line.indexOf(':') + 1).trim()
}