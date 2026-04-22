/**
 * @description 私信消息数据模型
 * @author milk
 */

const seq = require('../seq')
const { INTEGER, TEXT, BOOLEAN, DATE } = require('../types')

const Message = seq.define('message', {
    conversationId: {
        type: INTEGER,
        allowNull: false,
        comment: '会话 ID'
    },
    fromUserId: {
        type: INTEGER,
        allowNull: false,
        comment: '发送者用户 ID'
    },
    toUserId: {
        type: INTEGER,
        allowNull: false,
        comment: '接收者用户 ID'
    },
    content: {
        type: TEXT,
        allowNull: false,
        comment: '消息内容'
    },
    isRead: {
        type: BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: '是否已读'
    },
    deletedAt: {
        type: DATE,
        allowNull: true,
        comment: '软删除时间戳，null 表示未删除'
    }
})

module.exports = Message
