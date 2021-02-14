const { Tag } = require('../models')
const { success: successMsgs } = require('../docs/messages.json')

module.exports = {
  async getTags(req, res, next) {
    try {
      const UserId = req.user.id
      const tags = await Tag.findAll({ where: { UserId }, attributes: ['id', 'name'] })
      return res.json(tags)
    } catch (error) {
      next(error)
    }
  },
  async getTag(req, res, next) {
    try {
      const UserId = req.user.id
      const { id } = req.params
      const tag = await Tag.findOne({ where: { UserId, id }, attributes: ['id', 'name'] })
      if (!tag) throw new Error('notFound')
      return res.json(tag)
    } catch (error) {
      next(error)
    }
  },
  async createTag(req, res, next) {
    try {
      const UserId = req.user.id
      const { name } = req.body
      await Tag.findOrCreate({ where: { UserId, name } })
      return res.json({ status: 'success', message: successMsgs.general })
    } catch (error) {
      next(error)
    }
  },
  async editTag(req, res, next) {
    try {
      const UserId = req.user.id
      const { name } = req.body
      const { id } = req.params
      const tag = await Tag.findOne({ where: { id, UserId } })
      if (!tag) throw new Error('notFound')
      await tag.update({ name })
      return res.json({ status: 'success', message: successMsgs.general })
    } catch (error) {
      next(error)
    }
  },
  async deleteTag(req, res, next) {
    try {
      const UserId = req.user.id
      const { id } = req.params
      const tag = await Tag.findOne({ where: { id, UserId } })
      if (!tag) throw new Error('notFound')
      await tag.destroy()
      return res.json({ status: 'success', message: successMsgs.general })
    } catch (error) {
      next(error)
    }
  }
}