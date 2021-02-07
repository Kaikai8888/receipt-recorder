const redis = require('redis')
const client = process.env.REDIS_URL ? redis.createClient(process.env.REDIS_URL) : redis.createClient()
const { promisify } = require('util')
const setAsync = promisify(client.set).bind(client)
const getAsync = promisify(client.get).bind(client)
const existsAsync = promisify(client.exists).bind(client)

client.on('connect', () => console.log('Redis is connected'))
client.on('error', (error) => console.log('Redis not connected. error:', error))

module.exports = {
  client,
  setAsync,
  getAsync,
  existsAsync
}