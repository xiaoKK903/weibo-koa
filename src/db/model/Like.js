/**
 * @description 点赞模型
 * @author milk
 */

const seq = require('../seq')
const { INTEGER } = require('../types')

const Like = seq.define('like', {
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
            comment: '用户和微博的组合唯一索引，防止重复点赞'
        }
    ]
})

module.exports = Like