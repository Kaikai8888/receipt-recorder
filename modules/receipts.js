
const paymentTypes = require('../docs/payment_types.json')

function roundTo2Decimal(num) {
  return Math.round((num + Number.EPSILON) * 100) / 100
}

function getAfterColon(line) {
  return line.slice(line.indexOf(':') + 1).trim()
}

module.exports = {
  parse: {
    receiptNo(string) {
      const receiptNo = parseInt(getAfterColon(string))
      if (!receiptNo) throw new Error('format')
      return receiptNo
    },
    store(lines, start) {
      return {
        name: lines[start].trim(),
        tel: getAfterColon(lines[start + 1]),
        gstReg: getAfterColon(lines[start + 2])
      }
    },
    date(string) {
      const [date, time] = string.split(/\s+/).map(getAfterColon)
      const [day, month, year] = date.split('.')
      const dateObj = new Date(`${year}-${month}-${day}T${time}`)
      if (dateObj.toString() === 'Invalid Date') throw new Error('format')
      return dateObj
    },
    payment(string) {
      const payment = string.split(/\s+/)[0]
      if (!paymentTypes.includes(payment)) throw new Error('payment')
      return payment
    },
    products(lines, i) {
      const products = []
      const purchases = []
      while (lines[i].trim()) {
        //parse product info
        const productInfo = lines[i]
        const firstBlankIndex = productInfo.indexOf(' ')
        const product = {
          productNo: parseInt(productInfo.slice(0, firstBlankIndex))
        }
        if (!product.productNo) throw new Error('format')
        product.name = productInfo.slice(firstBlankIndex + 1)
        products.push(product)

        //parse purchase info
        const values = lines[i + 1].split(/\s+/)
        const quantity = parseFloat(values[0])
        const price = parseFloat(values[2])
        if (isNaN(quantity) || isNaN(price)) throw new Error('format')
        purchases.push({ productNo: product.productNo, quantity, price })
        //skip to next product
        i += 2
      }
      return { products, purchases, i }
    },
    tender(string, receipt) {
      const regExp = new RegExp(/TENDER \d+\.?\d*\s+CHANGE \d+\.?\d*/)
      if (regExp.test(string)) {
        const values = string.trim().split(/\s+/)
        receipt.tender = parseFloat(values[1])
        receipt.change = parseFloat(values[3])
      }
    }
  },
  formatReceipt(receipt) {
    receipt = {
      ...receipt.dataValues,
      tender: parseFloat(receipt.tender) || null,
      change: parseFloat(receipt.change) || null,
      qty: 0,
      items: 0,
      totalAmount: 0
    }

    if (receipt.Tagging) delete receipt.Tagging

    receipt.Products = receipt.Products.map(product => {
      let { quantity, price } = product.Purchase
      price = Number(price)
      const subtotal = quantity * price
      receipt.qty += quantity
      receipt.items++
      receipt.totalAmount += subtotal
      return {
        id: product.id,
        productNo: product.productNo,
        name: product.name,
        quantity,
        price,
        subtotal: roundTo2Decimal(subtotal),
      }
    })

    receipt.totalAmount = roundTo2Decimal(receipt.totalAmount)
    return receipt
  }

}