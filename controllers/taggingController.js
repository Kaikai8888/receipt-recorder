const { Tagging, Receipt, Tag } = require('../models')
const { success: successMsgs } = require('../docs/messages.json')

module.exports = {
  async addTag(req, res, next) {
    try {
      const { id: UserId } = req.user
      const ReceiptId = parseInt(req.body.ReceiptId)
      const TagId = parseInt(req.body.TagId)
      if (!ReceiptId || !TagId) throw new Error('invalidInput')
      const receipt = await Receipt.findOne({ where: { id: ReceiptId, UserId } })
      if (!receipt) throw new Error('notFound')
      const tag = await Tag.findOne({ where: { id: TagId, UserId } })
      if (!tag) throw new Error('notFound')

      const [_, created] = await Tagging.findOrCreate({ where: { ReceiptId, TagId } })
      if (!created) return res.json({ status: 'success', message: successMsgs.already })
      return res.json({ status: 'success', message: successMsgs.general })
    } catch (error) {
      next(error)
    }
  },
  async removeTag(req, res, next) {
    try {

    } catch (error) {
      next(error)
    }
  }
}
