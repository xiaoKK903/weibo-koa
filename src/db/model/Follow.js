/**
 * @description 关注模型
 * @author milk
 */

const { DataTypes } = require('sequelize')
const seq = require('../seq')

const Follow = seq.define('Follow', {
  // 关注者ID
  followerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '关注者ID'
  },
  // 被关注者ID
  followingId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '被关注者ID'
  }
}, {
  // 组合唯一索引，防止重复关注
  indexes: [
    {
      unique: true,
      fields: ['followerId', 'followingId']
    }
  ]
})

module.exports = Follow
