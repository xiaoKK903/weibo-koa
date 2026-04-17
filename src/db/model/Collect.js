/**
 * @description 收藏模型
 * @author milk
 */

const seq = require('../seq')
const { INTEGER } = require('../types')

const Collect = seq.define('collect', {
    userId: {
        type: INTEGER,
        allowNull: false,
        comment: '用户ID'
    },
    blogId: {
        type: INTEGER,
        allowNull: false,
        comment: '微博ID'
    }
}, {
    indexes: [
        {
            unique: true,
            fields: ['userId', 'blogId'],
            comment: '用户和微博的组合唯一索引，防止重复收藏'
        }
    ]
})

module.exports = Collect