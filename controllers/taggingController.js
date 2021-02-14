const { Tagging, Receipt, Tag, sequelize } = require('../models')
const { success: successMsgs } = require('../docs/messages.json')
const helpers = require('../modules/_helpers')

module.exports = {
  async addTag(req, res, next) {
    try {
      const { id: UserId } = helpers.getUser(req)
      const { ReceiptId, TagId } = req.body
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
      const { id: UserId } = helpers.getUser(req)
      const { TagId, ReceiptId } = req.body
      const tagging = await Tagging.findOne({ where: { TagId, ReceiptId }, include: Receipt })
      if (!tagging || tagging.dataValues.Receipt.UserId !== UserId) throw new Error('notFound')
      tagging.destroy()
      return res.json({ status: 'success', message: successMsgs.general })
    } catch (error) {
      next(error)
    }
  }
}
