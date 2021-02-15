
module.exports = {
  upsertOnFields: (model, fields, data) => new Promise(async (resolve, reject) => {
    try {
      const checkData = fields.reduce((checkData, field) => {
        checkData[field] = data[field]
        return checkData
      }, {})
      const instance = await model.findOne({ where: checkData })
      if (!instance) {
        const createdInstance = await model.create(data)
        return resolve([createdInstance, 'create'])
      }
      const change = Object.keys(data).some(field => data[field] !== instance.dataValues[field])
      if (!change) return resolve([instance, 'no-update'])
      const updatedInstance = await instance.update(data, { returning: true })
      return resolve([updatedInstance, 'update'])
    } catch (error) {
      reject(error)
    }
  }),
  truncateTables: async (...models) => {
    await Promise.all(models.map(model => model.destroy({ where: {}, truncate: true })))
  }
}