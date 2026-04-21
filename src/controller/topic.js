/**
 * @description 话题控制器
 * @author milk
 */

const { 
    getTopicList, 
    searchTopics, 
    getTopicDetail, 
    getTopicBlogs, 
    getHotTopics 
} = require('../services/topic')
const { SuccessModel, ErrorModel } = require('../model/ResModel')
const { loginCheck } = require('../middlewares/loginChecks')

/**
 * 获取话题列表
 * @param {Object} ctx koa ctx
 * @param {Object} param0 { pageIndex, sortBy }
 */
async function getList(ctx, { pageIndex = 0, sortBy = 'hot' }) {
    const result = await getTopicList(pageIndex, 20, sortBy)
    
    return new SuccessModel(result)
}

/**
 * 搜索话题
 * @param {Object} ctx koa ctx
 * @param {Object} param0 { keyword, pageIndex }
 */
async function search(ctx, { keyword, pageIndex = 0 }) {
    if (!keyword || keyword.trim() === '') {
        return new SuccessModel({
            count: 0,
            topics: []
        })
    }
    
    const result = await searchTopics(keyword.trim(), pageIndex, 20)
    
    return new SuccessModel(result)
}

/**
 * 获取话题详情
 * @param {Object} ctx koa ctx
 * @param {Object} param0 { topicIdOrName }
 */
async function getDetail(ctx, { topicIdOrName }) {
    let searchValue = topicIdOrName
    
    if (/^\d+$/.test(topicIdOrName)) {
        searchValue = parseInt(topicIdOrName)
    }
    
    const topic = await getTopicDetail(searchValue)
    
    if (!topic) {
        return new ErrorModel({
            errno: 19001,
            message: '话题不存在'
        })
    }
    
    return new SuccessModel(topic)
}

/**
 * 获取话题下的微博列表
 * @param {Object} ctx koa ctx
 * @param {Object} param0 { topicId, pageIndex }
 */
async function getBlogs(ctx, { topicId, pageIndex = 0 }) {
    let userId = null
    if (ctx.session && ctx.session.userInfo) {
        userId = ctx.session.userInfo.id
    }
    
    const result = await getTopicBlogs(parseInt(topicId), pageIndex, 10, userId)
    
    return new SuccessModel(result)
}

/**
 * 获取热门话题
 * @param {Object} ctx koa ctx
 * @param {Object} param0 { limit }
 */
async function getHot(ctx, { limit = 10 }) {
    const result = await getHotTopics(parseInt(limit))
    
    return new SuccessModel(result)
}

module.exports = {
    getList,
    search,
    getDetail,
    getBlogs,
    getHot
}
