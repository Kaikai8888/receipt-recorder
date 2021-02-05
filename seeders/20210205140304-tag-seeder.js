'use strict';
const { User } = require('../models')
const faker = require('faker')
const tags = ['food', 'transportation', 'housing', 'entertainment']

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      const users = await User.findAll()
      await queryInterface.bulkInsert('Tags', users.reduce((data, user) => {

        tags.forEach(tag => {
          const date = faker.date.between(user.createdAt, new Date())
          data.push({
            name: tag,
            UserId: user.id,
            createdAt: date,
            updatedAt: date
          })
        })
        return data
      }, []), {})
    } catch (error) {
      console.log(error)
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.bulkDelete('Tags', null, {})
    } catch (error) {
      console.log(error)
    }
  }
};
