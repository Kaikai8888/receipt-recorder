const { Tag } = require('../models')

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
      if (!tag) return res.status(404).json({ status: 'error', message: 'Cannot find the tag.' })
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
      return res.json({ status: 'success', message: 'ok' })
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
      if (!tag) return res.status(404).json({ status: 'error', message: 'Cannot find the tag.' })
      await tag.update({ name })
      return res.json({ status: 'success', message: 'ok' })
    } catch (error) {
      next(error)
    }
  },
  async deleteTag(req, res, next) {
    try {
      const UserId = req.user.id
      const { id } = req.params
      const tag = await Tag.findOne({ where: { id, UserId } })
      if (!tag) return res.status(404).json({ status: 'error', message: 'Cannot find the tag.' })
      await tag.destroy()
      return res.json({ status: 'success', message: 'ok' })
    } catch (error) {
      next(error)
    }
  }
}