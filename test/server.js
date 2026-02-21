/**
 * @description jest server
 * @author milk
 */

const request = require('supertest')
const server = require('../src/app').callback()

module.exports = request(server)
