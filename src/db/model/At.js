/**
 * @description @提醒 数据模型
 * @author milk
 */

const seq = require('../seq')
const { INTEGER, BOOLEAN, STRING } = require('../types')

const At = seq.define('at', {
    fromUserId: {
        type: INTEGER,
        allowNull: false,
        comment: '发送者ID（谁发的微博/评论）'
    },
    toUserId: {
        type: INTEGER,
        allowNull: false,
        comment: '接收者ID（被@的用户）'
    },
    blogId: {
        type: INTEGER,
        allowNull: false,
        comment: '微博ID'
    },
    commentId: {
        type: INTEGER,
        allowNull: true,
        comment: '评论ID（如果是在评论中@，则有这个字段）'
    },
    isRead: {
        type: BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: '是否已读'
    },
    type: {
        type: STRING,
        allowNull: false,
        defaultValue: 'blog',
        comment: '类型：blog（微博中@）或 comment（评论中@）'
    }
}, {
    indexes: [
        {
            fields: ['toUserId', 'isRead'],
            comment: '按接收者和已读状态查询的索引'
        },
        {
            unique: true,
            fields: ['fromUserId', 'toUserId', 'blogId', 'commentId'],
            comment: '防止重复@提醒'
        }
    ]
})

module.exports = At