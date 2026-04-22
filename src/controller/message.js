/**
 * @description 私信控制器
 * @author milk
 */

const { SuccessModel, ErrorModel } = require('../model/ResModel')
const {
    sendMessage,
    getConversationList,
    getMessageList,
    markMessagesAsRead,
    getTotalUnreadCount,
    isUserBlocked
} = require('../services/message')
const { getUserInfo } = require('../services/user')

const messageFailInfo = {
    errno: 19001,
    message: '消息发送失败'
}

const messageParamFailInfo = {
    errno: 19002,
    message: '参数不完整'
}

const messageBlockedInfo = {
    errno: 19003,
    message: '无法发送消息'
}

/**
 * 发送消息
 * @param {Object} ctx koa ctx
 * @param {Object} param0 { toUserId, content }
 */
async function create(ctx, { toUserId, content }) {
    const { id: fromUserId } = ctx.session.userInfo
    
    if (!toUserId || !content || content.trim() === '') {
        return new ErrorModel(messageParamFailInfo)
    }
    
    if (fromUserId === toUserId) {
        return new ErrorModel({
            errno: 19004,
            message: '不能给自己发消息'
        })
    }
    
    const isBlocked = await isUserBlocked(toUserId, fromUserId)
    if (isBlocked) {
        return new ErrorModel({
            errno: 19003,
            message: '对方已屏蔽您，无法发送消息'
        })
    }
    
    const isBlocked2 = await isUserBlocked(fromUserId, toUserId)
    if (isBlocked2) {
        return new ErrorModel({
            errno: 19005,
            message: '您已屏蔽对方，请先解除屏蔽'
        })
    }
    
    const result = await sendMessage(fromUserId, toUserId, content)
    
    if (result.success) {
        return new SuccessModel(result.data)
    }
    
    return new ErrorModel({
        ...messageFailInfo,
        message: result.message
    })
}

/**
 * 获取会话列表
 * @param {Object} ctx koa ctx
 */
async function getList(ctx) {
    const { id: userId } = ctx.session.userInfo
    
    const conversations = await getConversationList(userId)
    
    return new SuccessModel(conversations)
}

/**
 * 获取消息列表
 * @param {Object} ctx koa ctx
 * @param {Object} param0 { targetUserId, pageIndex, pageSize }
 */
async function getHistory(ctx, { targetUserId, pageIndex, pageSize }) {
    const { id: userId } = ctx.session.userInfo
    
    if (!targetUserId) {
        return new ErrorModel(messageParamFailInfo)
    }
    
    const pIndex = pageIndex ? parseInt(pageIndex) : 0
    const pSize = pageSize ? parseInt(pageSize) : 20
    
    await markMessagesAsRead(userId, targetUserId)
    
    const result = await getMessageList(userId, targetUserId, pIndex, pSize)
    
    return new SuccessModel(result)
}

/**
 * 获取总未读消息数
 * @param {Object} ctx koa ctx
 */
async function getUnreadCount(ctx) {
    const { id: userId } = ctx.session.userInfo
    
    const count = await getTotalUnreadCount(userId)
    
    return new SuccessModel({ count })
}

/**
 * 标记消息为已读
 * @param {Object} ctx koa ctx
 * @param {Object} param0 { targetUserId }
 */
async function markAsRead(ctx, { targetUserId }) {
    const { id: userId } = ctx.session.userInfo
    
    if (!targetUserId) {
        return new ErrorModel(messageParamFailInfo)
    }
    
    await markMessagesAsRead(userId, targetUserId)
    
    return new SuccessModel()
}

/**
 * 检查是否可以发送消息
 * @param {Object} ctx koa ctx
 * @param {Object} param0 { targetUserId }
 */
async function checkCanSend(ctx, { targetUserId }) {
    const { id: userId } = ctx.session.userInfo
    
    if (!targetUserId) {
        return new ErrorModel(messageParamFailInfo)
    }
    
    if (userId === targetUserId) {
        return new ErrorModel({
            errno: 19004,
            message: '不能给自己发消息'
        })
    }
    
    const isBlocked = await isUserBlocked(targetUserId, userId)
    if (isBlocked) {
        return new ErrorModel({
            errno: 19003,
            message: '对方已屏蔽您，无法发送消息'
        })
    }
    
    const isBlocked2 = await isUserBlocked(userId, targetUserId)
    if (isBlocked2) {
        return new ErrorModel({
            errno: 19005,
            message: '您已屏蔽对方，请先解除屏蔽'
        })
    }
    
    return new SuccessModel({ canSend: true })
}

module.exports = {
    create,
    getList,
    getHistory,
    getUnreadCount,
    markAsRead,
    checkCanSend
}
