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
        allowNull: true,
        comment: '微博ID（微博点赞时使用）'
    },
    commentId: {
        type: INTEGER,
        allowNull: true,
        comment: '评论ID（评论点赞时使用）'
    }
}, {
    indexes: [
        {
            unique: true,
            fields: ['userId', 'blogId'],
            comment: '用户和微博的组合唯一索引，防止重复点赞微博'
        },
        {
            unique: true,
            fields: ['userId', 'commentId'],
            comment: '用户和评论的组合唯一索引，防止重复点赞评论'
        }
    ]
})

module.exports = Like