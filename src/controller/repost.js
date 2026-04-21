/**
 * @description 转发控制器
 * @author milk
 */

const { createRepost, cancelRepost, hasReposted, getRepostCount, getRepostList, getBlogWithRepostInfo } = require('../services/repost')
const { SuccessModel, ErrorModel } = require('../model/ResModel')
const { repostFailInfo, repostNotExistInfo, repostCancelFailInfo, repostAlreadyExistInfo } = require('../model/ErrorInfo')

/**
 * 创建转发
 * @param {Object} ctx koa ctx
 * @param {Object} param0 { sourceBlogId, content }
 */
async function create(ctx, { sourceBlogId, content }) {
    const { id: userId } = ctx.session.userInfo
    
    const result = await createRepost(userId, sourceBlogId, content)
    
    if (result.success) {
        return new SuccessModel(result.data)
    }
    
    if (result.message === '您已经转发过这条微博了') {
        return new ErrorModel(repostAlreadyExistInfo)
    }
    
    return new ErrorModel({
        ...repostFailInfo,
        message: result.message
    })
}

/**
 * 取消转发
 * @param {Object} ctx koa ctx
 * @param {Object} param0 { blogId }
 */
async function cancel(ctx, { blogId }) {
    const { id: userId } = ctx.session.userInfo
    
    const result = await cancelRepost(userId, blogId)
    
    if (result.success) {
        return new SuccessModel()
    }
    
    if (result.message === '转发记录不存在') {
        return new ErrorModel(repostNotExistInfo)
    }
    
    return new ErrorModel({
        ...repostCancelFailInfo,
        message: result.message
    })
}

/**
 * 检查是否已转发
 * @param {Object} ctx koa ctx
 * @param {Object} param0 { blogId }
 */
async function check(ctx, { blogId }) {
    const { id: userId } = ctx.session.userInfo
    
    const hasRepostedResult = await hasReposted(userId, blogId)
    const repostCount = await getRepostCount(blogId, true)
    
    return new SuccessModel({
        hasReposted: hasRepostedResult,
        repostCount
    })
}

/**
 * 获取转发列表
 * @param {Object} ctx koa ctx
 * @param {Object} param0 { blogId, pageIndex, includeAll }
 */
async function getList(ctx, { blogId, pageIndex = 0, includeAll = true }) {
    const result = await getRepostList(blogId, pageIndex, 10, includeAll)
    
    return new SuccessModel(result)
}

/**
 * 获取微博的转发信息
 * @param {Object} ctx koa ctx
 * @param {Object} param0 { blogId }
 */
async function getRepostInfo(ctx, { blogId }) {
    const result = await getBlogWithRepostInfo(blogId)
    
    if (!result) {
        return new ErrorModel(repostNotExistInfo)
    }
    
    return new SuccessModel(result)
}

module.exports = {
    create,
    cancel,
    check,
    getList,
    getRepostInfo
}
