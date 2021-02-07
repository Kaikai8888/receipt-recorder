const { Tag } = require('../models')

module.exports = {
  async getTags(req, res) {
    try {
      const UserId = req.user.id
      const tags = await Tag.findAll({ where: { UserId }, attributes: ['id', 'name'] })
      return res.json(tags)
    } catch (error) {
      next(error)
    }
  }
}