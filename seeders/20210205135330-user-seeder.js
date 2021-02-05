'use strict';
const bcrypt = require('bcryptjs')
const faker = require('faker')
const users = [
  { name: 'user1', email: 'user1@example.com', password: '12345678' },
  { name: 'user2', email: 'user2@example.com', password: '12345678' }
]


module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.bulkInsert('Users', users.map(user => {
        const date = faker.date.between(new Date('2020-01-01'), new Date('2020-03-31'))
        user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(10))
        return {
          ...user,
          createdAt: date,
          updatedAt: date
        }
      }), {})
    } catch (error) {
      console.log(error)
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.bulkDelete('Users', null, {})
    } catch (error) {
      console.log(error)
    }
  }
};
