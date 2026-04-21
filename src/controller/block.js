/**
 * @description 屏蔽控制器
 * @author milk
 */

const { 
    blockUser, 
    unblockUser, 
    checkBlockStatus, 
    getBlockedUsers, 
    getBlockedCount,
    checkIsBlockedBy
} = require('../services/block')
const { SuccessModel, ErrorModel } = require('../model/ResModel')
const { User } = require('../db/model/index')

/**
 * 屏蔽用户
 * @param {Object} ctx koa2 ctx
 * @param {number} blockedId 被屏蔽者ID
 */
async function block(ctx, blockedId) {
    const { id: blockerId } = ctx.session.userInfo
    
    if (blockerId === blockedId) {
        return new ErrorModel({ errno: -1, message: '不能屏蔽自己' })
    }
    
    try {
        const targetUser = await User.findOne({ where: { id: blockedId } })
        if (!targetUser) {
            return new ErrorModel({ errno: -1, message: '用户不存在' })
        }
        
        const result = await blockUser(blockerId, blockedId)
        if (result.success) {
            return new SuccessModel({ message: '屏蔽成功' })
        } else {
            return new ErrorModel({ errno: -1, message: result.message })
        }
    } catch (ex) {
        console.error(ex.message, ex.stack)
        return new ErrorModel({ errno: -1, message: '屏蔽失败' })
    }
}

/**
 * 取消屏蔽用户
 * @param {Object} ctx koa2 ctx
 * @param {number} blockedId 被屏蔽者ID
 */
async function unblock(ctx, blockedId) {
    const { id: blockerId } = ctx.session.userInfo
    
    try {
        const result = await unblockUser(blockerId, blockedId)
        if (result.success) {
            return new SuccessModel({ message: '取消屏蔽成功' })
        } else {
            return new ErrorModel({ errno: -1, message: result.message })
        }
    } catch (ex) {
        console.error(ex.message, ex.stack)
        return new ErrorModel({ errno: -1, message: '取消屏蔽失败' })
    }
}

/**
 * 检查屏蔽状态
 * @param {Object} ctx koa2 ctx
 * @param {number} blockedId 被屏蔽者ID
 */
async function checkBlock(ctx, blockedId) {
    const { id: blockerId } = ctx.session.userInfo
    
    try {
        const isBlocked = await checkBlockStatus(blockerId, blockedId)
        return new SuccessModel({ isBlocked })
    } catch (ex) {
        console.error(ex.message, ex.stack)
        return new SuccessModel({ isBlocked: false })
    }
}

/**
 * 检查是否被对方屏蔽
 * @param {Object} ctx koa2 ctx
 * @param {number} targetUserId 目标用户ID
 */
async function checkIsBlocked(ctx, targetUserId) {
    const { id: userId } = ctx.session.userInfo
    
    try {
        const isBlocked = await checkIsBlockedBy(userId, targetUserId)
        return new SuccessModel({ isBlocked })
    } catch (ex) {
        console.error(ex.message, ex.stack)
        return new SuccessModel({ isBlocked: false })
    }
}

/**
 * 获取已屏蔽用户列表
 * @param {Object} ctx koa2 ctx
 */
async function getBlockedList(ctx) {
    const { id: blockerId } = ctx.session.userInfo
    
    try {
        const blockedList = await getBlockedUsers(blockerId)
        const blockedCount = await getBlockedCount(blockerId)
        
        return new SuccessModel({
            list: blockedList,
            count: blockedCount
        })
    } catch (ex) {
        console.error(ex.message, ex.stack)
        return new SuccessModel({
            list: [],
            count: 0
        })
    }
}

/**
 * 获取已屏蔽用户数
 * @param {Object} ctx koa2 ctx
 */
async function getBlockedListCount(ctx) {
    const { id: blockerId } = ctx.session.userInfo
    
    try {
        const count = await getBlockedCount(blockerId)
        return new SuccessModel({ count })
    } catch (ex) {
        console.error(ex.message, ex.stack)
        return new SuccessModel({ count: 0 })
    }
}

module.exports = {
    block,
    unblock,
    checkBlock,
    checkIsBlocked,
    getBlockedList,
    getBlockedListCount
}
