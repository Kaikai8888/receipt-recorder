module.exports = {
  roundTo2Decimal: (num) => Math.round((num + Number.EPSILON) * 100) / 100
}