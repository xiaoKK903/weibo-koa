/**
 * @description 微博-话题关联数据模型
 * @author milk
 */

const seq = require('../seq')
const { INTEGER, DATE } = require('../types')

const BlogTopic = seq.define('blogTopic', {
    blogId: {
        type: INTEGER,
        allowNull: false,
        comment: '微博 ID'
    },
    topicId: {
        type: INTEGER,
        allowNull: false,
        comment: '话题 ID'
    },
    deletedAt: {
        type: DATE,
        allowNull: true,
        comment: '软删除时间戳，null 表示未删除'
    }
}, {
    indexes: [
        {
            unique: true,
            fields: ['blogId', 'topicId']
        },
        {
            fields: ['topicId']
        }
    ]
})

module.exports = BlogTopic
