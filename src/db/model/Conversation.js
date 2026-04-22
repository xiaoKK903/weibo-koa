/**
 * @description 私信会话数据模型
 * @author milk
 */

const seq = require('../seq')
const { INTEGER, DATE } = require('../types')

const Conversation = seq.define('conversation', {
    user1Id: {
        type: INTEGER,
        allowNull: false,
        comment: '用户1 ID（较小的用户ID）'
    },
    user2Id: {
        type: INTEGER,
        allowNull: false,
        comment: '用户2 ID（较大的用户ID）'
    },
    lastMessageId: {
        type: INTEGER,
        allowNull: true,
        comment: '最后一条消息 ID'
    },
    lastMessageAt: {
        type: DATE,
        allowNull: true,
        comment: '最后消息时间'
    },
    user1Unread: {
        type: INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '用户1的未读消息数'
    },
    user2Unread: {
        type: INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '用户2的未读消息数'
    },
    deletedAt: {
        type: DATE,
        allowNull: true,
        comment: '软删除时间戳，null 表示未删除'
    }
})

module.exports = Conversation
