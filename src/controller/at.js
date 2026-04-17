/**
 * @description @提醒 控制器
 * @author milk
 */

const { getAtListByUserId, getUnreadAtCount, markAsRead, markAllAsRead } = require('../services/at')
const { SuccessModel, ErrorModel } = require('../model/ResModel')

/**
 * 获取用户的 @提醒列表
 * @param {Object} ctx koa2 ctx
 * @param {number} pageIndex 页码
 * @param {number} pageSize 每页数量
 * @param {boolean} onlyUnread 是否只获取未读
 */
async function getAtList(ctx, pageIndex = 0, pageSize = 10, onlyUnread = false) {
    try {
        const userId = ctx.session.userInfo.id
        const result = await getAtListByUserId(userId, pageIndex, pageSize, onlyUnread)
        return new SuccessModel(result)
    } catch (ex) {
        console.error(ex.message, ex.stack)
        return new ErrorModel({ errno: 16001, message: '获取通知列表失败' })
    }
}

/**
 * 获取用户未读 @提醒 的数量
 * @param {Object} ctx koa2 ctx
 */
async function getUnreadCount(ctx) {
    try {
        const userId = ctx.session.userInfo.id
        const count = await getUnreadAtCount(userId)
        return new SuccessModel({ count })
    } catch (ex) {
        console.error(ex.message, ex.stack)
        return new ErrorModel({ errno: 16002, message: '获取未读通知数量失败' })
    }
}

/**
 * 标记单条 @提醒 为已读
 * @param {Object} ctx koa2 ctx
 * @param {number} atId @提醒 ID
 */
async function markSingleAsRead(ctx, atId) {
    try {
        const userId = ctx.session.userInfo.id
        const result = await markAsRead(atId, userId)
        if (result) {
            return new SuccessModel()
        } else {
            return new ErrorModel({ errno: 16003, message: '标记已读失败' })
        }
    } catch (ex) {
        console.error(ex.message, ex.stack)
        return new ErrorModel({ errno: 16003, message: '标记已读失败' })
    }
}

/**
 * 标记所有 @提醒 为已读
 * @param {Object} ctx koa2 ctx
 */
async function markAllAsReadController(ctx) {
    try {
        const userId = ctx.session.userInfo.id
        const count = await markAllAsRead(userId)
        return new SuccessModel({ count })
    } catch (ex) {
        console.error(ex.message, ex.stack)
        return new ErrorModel({ errno: 16004, message: '标记全部已读失败' })
    }
}

module.exports = {
    getAtList,
    getUnreadCount,
    markSingleAsRead,
    markAllAsReadController
}