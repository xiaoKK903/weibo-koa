/**
 * @description 点赞控制器
 * @author milk
 */

const { createLike, deleteLike, getLikesByUserId, getLikeByUserIdAndBlogId, getLikeCountByBlogId } = require('../services/like')
const { SuccessModel, ErrorModel } = require('../model/ResModel')
const { likeFailInfo, cancelLikeFailInfo, getLikesFailInfo } = require('../model/ErrorInfo')

/**
 * 点赞微博
 * @param {Object} ctx koa2 ctx
 * @param {number} blogId 微博ID
 */
async function like(ctx, blogId) {
    try {
        const userId = ctx.session.userInfo.id
        const like = await getLikeByUserIdAndBlogId(userId, blogId)
        if (like) {
            return new SuccessModel()
        }
        await createLike(userId, blogId)
        return new SuccessModel()
    } catch (ex) {
        console.error(ex.message, ex.stack)
        return new ErrorModel(likeFailInfo)
    }
}

/**
 * 取消点赞
 * @param {Object} ctx koa2 ctx
 * @param {number} blogId 微博ID
 */
async function cancelLike(ctx, blogId) {
    try {
        const userId = ctx.session.userInfo.id
        const like = await getLikeByUserIdAndBlogId(userId, blogId)
        if (!like) {
            return new SuccessModel()
        }
        const result = await deleteLike(userId, blogId)
        if (result) {
            return new SuccessModel()
        } else {
            return new ErrorModel(cancelLikeFailInfo)
        }
    } catch (ex) {
        console.error(ex.message, ex.stack)
        return new ErrorModel(cancelLikeFailInfo)
    }
}

/**
 * 获取用户点赞列表
 * @param {Object} ctx koa2 ctx
 * @param {number} pageIndex 页码
 * @param {number} pageSize 每页数量
 */
async function getLikes(ctx, pageIndex = 0, pageSize = 10) {
    try {
        const userId = ctx.session.userInfo.id
        const result = await getLikesByUserId(userId, pageIndex, pageSize)
        return new SuccessModel(result)
    } catch (ex) {
        console.error(ex.message, ex.stack)
        return new ErrorModel(getLikesFailInfo)
    }
}

/**
 * 获取微博的点赞数
 * @param {number} blogId 微博ID
 */
async function getLikeCount(blogId) {
    try {
        const count = await getLikeCountByBlogId(blogId)
        return new SuccessModel({ count })
    } catch (ex) {
        console.error(ex.message, ex.stack)
        return new ErrorModel(likeFailInfo)
    }
}

/**
 * 检查用户是否点赞了指定微博
 * @param {Object} ctx koa2 ctx
 * @param {number} blogId 微博ID
 */
async function checkLike(ctx, blogId) {
    try {
        const userId = ctx.session.userInfo.id
        const like = await getLikeByUserIdAndBlogId(userId, blogId)
        return new SuccessModel({ isLiked: !!like })
    } catch (ex) {
        console.error(ex.message, ex.stack)
        return new ErrorModel(likeFailInfo)
    }
}

module.exports = {
    like,
    cancelLike,
    getLikes,
    getLikeCount,
    checkLike
}