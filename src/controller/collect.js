/**
 * @description 收藏控制器
 * @author milk
 */

const { createCollect, deleteCollect, getCollectsByUserId, getCollectByUserIdAndBlogId, getCollectCountByBlogId } = require('../services/collect')
const { SuccessModel, ErrorModel } = require('../model/ResModel')
const { collectFailInfo, cancelCollectFailInfo, getCollectsFailInfo } = require('../model/ErrorInfo')

/**
 * 收藏微博
 * @param {number} userId 用户ID
 * @param {number} blogId 微博ID
 */
async function collect(ctx, blogId) {
    try {
        const userId = ctx.session.userInfo.id
        // 检查是否已经收藏
        const collect = await getCollectByUserIdAndBlogId(userId, blogId)
        if (collect) {
            return new SuccessModel() // 已经收藏，返回成功
        }
        // 创建收藏
        await createCollect(userId, blogId)
        return new SuccessModel()
    } catch (ex) {
        console.error(ex.message, ex.stack)
        return new ErrorModel(collectFailInfo)
    }
}

/**
 * 取消收藏
 * @param {number} userId 用户ID
 * @param {number} blogId 微博ID
 */
async function cancelCollect(ctx, blogId) {
    try {
        const userId = ctx.session.userInfo.id
        // 检查是否已经收藏
        const collect = await getCollectByUserIdAndBlogId(userId, blogId)
        if (!collect) {
            return new SuccessModel() // 已经取消收藏，返回成功
        }
        // 取消收藏
        const result = await deleteCollect(userId, blogId)
        if (result) {
            return new SuccessModel()
        } else {
            return new ErrorModel(cancelCollectFailInfo)
        }
    } catch (ex) {
        console.error(ex.message, ex.stack)
        return new ErrorModel(cancelCollectFailInfo)
    }
}

/**
 * 获取用户收藏列表
 * @param {number} userId 用户ID
 * @param {number} pageIndex 页码
 * @param {number} pageSize 每页数量
 */
async function getCollects(ctx, pageIndex = 0, pageSize = 10) {
    try {
        const userId = ctx.session.userInfo.id
        const result = await getCollectsByUserId(userId, pageIndex, pageSize)
        return new SuccessModel(result)
    } catch (ex) {
        console.error(ex.message, ex.stack)
        return new ErrorModel(getCollectsFailInfo)
    }
}

/**
 * 获取微博的收藏数
 * @param {number} blogId 微博ID
 */
async function getCollectCount(blogId) {
    try {
        const count = await getCollectCountByBlogId(blogId)
        return new SuccessModel({ count })
    } catch (ex) {
        console.error(ex.message, ex.stack)
        return new ErrorModel(collectFailInfo)
    }
}

/**
 * 检查用户是否收藏了指定微博
 * @param {number} userId 用户ID
 * @param {number} blogId 微博ID
 */
async function checkCollect(ctx, blogId) {
    try {
        const userId = ctx.session.userInfo.id
        const collect = await getCollectByUserIdAndBlogId(userId, blogId)
        return new SuccessModel({ isCollected: !!collect })
    } catch (ex) {
        console.error(ex.message, ex.stack)
        return new ErrorModel(collectFailInfo)
    }
}

module.exports = {
    collect,
    cancelCollect,
    getCollects,
    getCollectCount,
    checkCollect
}