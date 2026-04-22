/**
 * @description 私信服务
 * @author milk
 */

const { Conversation, Message, User, Block } = require('../db/model/index')
const { formatUser } = require('./_format')
const { Op } = require('sequelize')

const DEFAULT_WHERE = {
    deletedAt: null
}

/**
 * 检查用户是否被屏蔽
 * @param {number} blockerId 屏蔽者ID
 * @param {number} blockedId 被屏蔽者ID
 * @returns {boolean} 是否被屏蔽
 */
async function isUserBlocked(blockerId, blockedId) {
    if (!blockerId || !blockedId) {
        return false
    }
    
    const block = await Block.findOne({
        where: {
            blockerId,
            blockedId,
            ...DEFAULT_WHERE
        }
    })
    
    return !!block
}

/**
 * 获取或创建会话
 * @param {number} user1Id 用户1 ID
 * @param {number} user2Id 用户2 ID
 * @returns {Object} 会话对象
 */
async function getOrCreateConversation(user1Id, user2Id) {
    const smallerUserId = Math.min(user1Id, user2Id)
    const largerUserId = Math.max(user1Id, user2Id)
    
    const [conversation, created] = await Conversation.findOrCreate({
        where: {
            user1Id: smallerUserId,
            user2Id: largerUserId,
            ...DEFAULT_WHERE
        },
        defaults: {
            user1Id: smallerUserId,
            user2Id: largerUserId,
            user1Unread: 0,
            user2Unread: 0
        }
    })
    
    return conversation.dataValues
}

/**
 * 获取会话对象（如果不存在返回 null）
 * @param {number} user1Id 用户1 ID
 * @param {number} user2Id 用户2 ID
 * @returns {Object|null} 会话对象
 */
async function getConversation(user1Id, user2Id) {
    const smallerUserId = Math.min(user1Id, user2Id)
    const largerUserId = Math.max(user1Id, user2Id)
    
    const conversation = await Conversation.findOne({
        where: {
            user1Id: smallerUserId,
            user2Id: largerUserId,
            ...DEFAULT_WHERE
        }
    })
    
    if (!conversation) {
        return null
    }
    
    return conversation.dataValues
}

/**
 * 发送消息
 * @param {number} fromUserId 发送者 ID
 * @param {number} toUserId 接收者 ID
 * @param {string} content 消息内容
 * @returns {Object} 消息对象
 */
async function sendMessage(fromUserId, toUserId, content) {
    if (!fromUserId || !toUserId || !content || content.trim() === '') {
        return {
            success: false,
            message: '参数不完整'
        }
    }
    
    if (fromUserId === toUserId) {
        return {
            success: false,
            message: '不能给自己发消息'
        }
    }
    
    const isBlocked = await isUserBlocked(toUserId, fromUserId)
    if (isBlocked) {
        return {
            success: false,
            message: '对方已屏蔽您，无法发送消息'
        }
    }
    
    const isBlocked2 = await isUserBlocked(fromUserId, toUserId)
    if (isBlocked2) {
        return {
            success: false,
            message: '您已屏蔽对方，请先解除屏蔽'
        }
    }
    
    const conversation = await getOrCreateConversation(fromUserId, toUserId)
    
    const smallerUserId = Math.min(fromUserId, toUserId)
    const largerUserId = Math.max(fromUserId, toUserId)
    
    const isFromSmaller = fromUserId === smallerUserId
    
    const message = await Message.create({
        conversationId: conversation.id,
        fromUserId,
        toUserId,
        content: content.trim(),
        isRead: false
    })
    
    const now = new Date()
    
    if (isFromSmaller) {
        await Conversation.update(
            {
                lastMessageId: message.id,
                lastMessageAt: now,
                user2Unread: Op.col('user2Unread') + 1
            },
            {
                where: {
                    id: conversation.id
                }
            }
        )
    } else {
        await Conversation.update(
            {
                lastMessageId: message.id,
                lastMessageAt: now,
                user1Unread: Op.col('user1Unread') + 1
            },
            {
                where: {
                    id: conversation.id
                }
            }
        )
    }
    
    return {
        success: true,
        data: message.dataValues
    }
}

/**
 * 获取会话列表
 * @param {number} userId 用户 ID
 * @returns {Array} 会话列表
 */
async function getConversationList(userId) {
    if (!userId) {
        return []
    }
    
    const conversations = await Conversation.findAll({
        where: {
            [Op.or]: [
                { user1Id: userId },
                { user2Id: userId }
            ],
            ...DEFAULT_WHERE
        },
        include: [
            {
                model: User,
                as: 'user1',
                attributes: ['id', 'userName', 'nickName', 'picture']
            },
            {
                model: User,
                as: 'user2',
                attributes: ['id', 'userName', 'nickName', 'picture']
            }
        ],
        order: [['lastMessageAt', 'DESC']]
    })
    
    const result = []
    
    for (const conv of conversations) {
        const convData = conv.dataValues
        
        const isUser1 = convData.user1Id === userId
        const targetUser = isUser1 ? conv.user2 : conv.user1
        
        const unreadCount = isUser1 ? convData.user1Unread : convData.user2Unread
        
        const messages = await Message.findAll({
            where: {
                conversationId: convData.id,
                ...DEFAULT_WHERE
            },
            order: [['createdAt', 'DESC']],
            limit: 1
        })
        
        let lastMessage = null
        if (messages && messages.length > 0) {
            lastMessage = messages[0].dataValues
        }
        
        result.push({
            conversationId: convData.id,
            targetUser: targetUser ? formatUser(targetUser.dataValues) : null,
            unreadCount: unreadCount || 0,
            lastMessage: lastMessage,
            lastMessageAt: convData.lastMessageAt
        })
    }
    
    return result
}

/**
 * 获取会话消息列表
 * @param {number} userId 当前用户 ID
 * @param {number} targetUserId 目标用户 ID
 * @param {number} pageIndex 页码
 * @param {number} pageSize 每页数量
 * @returns {Object} 消息列表
 */
async function getMessageList(userId, targetUserId, pageIndex = 0, pageSize = 20) {
    if (!userId || !targetUserId) {
        return {
            count: 0,
            messages: []
        }
    }
    
    const conversation = await getConversation(userId, targetUserId)
    
    if (!conversation) {
        return {
            count: 0,
            messages: []
        }
    }
    
    const offset = pageIndex * pageSize
    
    const result = await Message.findAndCountAll({
        where: {
            conversationId: conversation.id,
            ...DEFAULT_WHERE
        },
        include: [
            {
                model: User,
                as: 'fromUser',
                attributes: ['id', 'userName', 'nickName', 'picture']
            },
            {
                model: User,
                as: 'toUser',
                attributes: ['id', 'userName', 'nickName', 'picture']
            }
        ],
        order: [['createdAt', 'DESC']],
        limit: pageSize,
        offset: offset
    })
    
    const messages = []
    
    for (const msg of result.rows) {
        const msgData = msg.dataValues
        
        messages.push({
            id: msgData.id,
            conversationId: msgData.conversationId,
            fromUserId: msgData.fromUserId,
            toUserId: msgData.toUserId,
            content: msgData.content,
            isRead: msgData.isRead,
            isRecalled: msgData.isRecalled,
            recalledAt: msgData.recalledAt,
            createdAt: msgData.createdAt,
            fromUser: msgData.fromUser ? formatUser(msgData.fromUser.dataValues) : null,
            toUser: msgData.toUser ? formatUser(msgData.toUser.dataValues) : null,
            isMine: msgData.fromUserId === userId
        })
    }
    
    return {
        count: result.count,
        messages: messages.reverse()
    }
}

/**
 * 标记会话消息为已读
 * @param {number} userId 当前用户 ID
 * @param {number} targetUserId 目标用户 ID
 * @returns {boolean} 是否成功
 */
async function markMessagesAsRead(userId, targetUserId) {
    if (!userId || !targetUserId) {
        return false
    }
    
    const conversation = await getConversation(userId, targetUserId)
    
    if (!conversation) {
        return true
    }
    
    const smallerUserId = Math.min(userId, targetUserId)
    const largerUserId = Math.max(userId, targetUserId)
    
    const isUser1 = userId === smallerUserId
    
    await Message.update(
        {
            isRead: true
        },
        {
            where: {
                conversationId: conversation.id,
                toUserId: userId,
                isRead: false,
                ...DEFAULT_WHERE
            }
        }
    )
    
    if (isUser1) {
        await Conversation.update(
            {
                user1Unread: 0
            },
            {
                where: {
                    id: conversation.id
                }
            }
        )
    } else {
        await Conversation.update(
            {
                user2Unread: 0
            },
            {
                where: {
                    id: conversation.id
                }
            }
        )
    }
    
    return true
}

/**
 * 获取用户总未读消息数
 * @param {number} userId 用户 ID
 * @returns {number} 未读消息数
 */
async function getTotalUnreadCount(userId) {
    if (!userId) {
        return 0
    }
    
    const conversations = await Conversation.findAll({
        where: {
            [Op.or]: [
                { user1Id: userId },
                { user2Id: userId }
            ],
            ...DEFAULT_WHERE
        }
    })
    
    let total = 0
    
    for (const conv of conversations) {
        const convData = conv.dataValues
        const isUser1 = convData.user1Id === userId
        const unreadCount = isUser1 ? convData.user1Unread : convData.user2Unread
        total += unreadCount || 0
    }
    
    return total
}

/**
 * 撤回消息
 * @param {number} userId 当前用户 ID
 * @param {number} messageId 消息 ID
 * @returns {Object} 操作结果
 */
async function recallMessage(userId, messageId) {
    if (!userId || !messageId) {
        return {
            success: false,
            message: '参数不完整'
        }
    }
    
    const message = await Message.findOne({
        where: {
            id: messageId,
            ...DEFAULT_WHERE
        }
    })
    
    if (!message) {
        return {
            success: false,
            message: '消息不存在'
        }
    }
    
    const msgData = message.dataValues
    
    if (msgData.fromUserId !== userId) {
        return {
            success: false,
            message: '只能撤回自己发送的消息'
        }
    }
    
    if (msgData.isRecalled) {
        return {
            success: false,
            message: '消息已撤回'
        }
    }
    
    const now = new Date()
    const msgTime = new Date(msgData.createdAt)
    const diffMinutes = (now - msgTime) / (1000 * 60)
    
    if (diffMinutes > 2) {
        return {
            success: false,
            message: '只能撤回2分钟内发送的消息'
        }
    }
    
    await Message.update(
        {
            isRecalled: true,
            recalledAt: now
        },
        {
            where: {
                id: messageId
            }
        }
    )
    
    return {
        success: true,
        message: '撤回成功',
        data: {
            messageId: messageId,
            isRecalled: true,
            recalledAt: now
        }
    }
}

module.exports = {
    isUserBlocked,
    getOrCreateConversation,
    getConversation,
    sendMessage,
    getConversationList,
    getMessageList,
    markMessagesAsRead,
    getTotalUnreadCount,
    recallMessage
}
