'use strict';
const { User, Tag } = require('../models')
const faker = require('faker')
const expense = { food: 'dinner', housing: 'rent', transportation: 'bus', entertainment: 'movies' }

function generateNumber(numbers) {
  //generate unique invoice number
  let number = ''
  const ACharCode = 'A'.charCodeAt()
  const ZCharCode = 'Z'.charCodeAt()

  do {
    for (let i = 0; i < 2; i++) {
      const charCode = Math.floor(Math.random() * (ZCharCode - ACharCode)) + ACharCode
      number += String.fromCharCode(charCode)
    }
    number += '-' + randomNumber(8)
  } while (numbers.includes(number))
  numbers.push(number)
  return number
}

function randomNumber(digits) {
  let number = ''
  for (let i = 0; i < digits; i++) {
    number += `${Math.floor(Math.random() * 10)}`
  }
  return number
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      const users = await User.findAll()
      const tags = await Tag.findAll()
      const numbers = []

      //every user has 1 to 10 invoices for each tag
      await queryInterface.bulkInsert('Invoices', users.reduce((data, user) => {
        tags.filter(tag => tag.UserId === user.id)
          .forEach(tag => {
            for (let i = 0; i < Math.floor(Math.random() * 10) + 1; i++) {
              let number = generateNumber(numbers)
              let sellerNumber = randomNumber(8)
              const date = faker.date.between(tag.createdAt, new Date())

              data.push({
                UserId: user.id,
                TagId: tag.id,
                number,
                date,
                amount: faker.finance.amount(0.001, 10000, 2),
                sellerNumber,
                createdAt: date,
                updatedAt: date
              })
            }
          })
        return data
      }, []))
    } catch (error) {
      console.log(error)
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.bulkDelete('Invoices', null, {})
    } catch (error) {
      console.log(error)
    }
  }
};
