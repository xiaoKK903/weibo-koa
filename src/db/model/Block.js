/**
 * @description 屏蔽模型
 * @author milk
 */

const { DataTypes } = require('sequelize')
const seq = require('../seq')

const Block = seq.define('Block', {
  blockerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '屏蔽者ID'
  },
  blockedId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '被屏蔽者ID'
  }
}, {
  indexes: [
    {
      unique: true,
      fields: ['blockerId', 'blockedId']
    }
  ]
})

module.exports = Block
