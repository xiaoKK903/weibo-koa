/**
 * @description 微博详情页 controller
 * @author milk
 */

const { getBlogById, createComment: createCommentService, getCommentsByBlogId } = require('../services/blog')
const { SuccessModel, ErrorModel } = require('../model/ResModel')
const { blogNotExistInfo, createCommentFailInfo } = require('../model/ErrorInfo')
const xss = require('xss')

/**
 * 获取微博详情
 * @param {number} blogId 微博ID
 * @param {number} userId 当前用户ID
 */
async function getBlogDetail(blogId, userId = null) {
    const blog = await getBlogById(blogId, userId)
    if (!blog) {
        return new ErrorModel(blogNotExistInfo)
    }
    return new SuccessModel(blog)
}

/**
 * 创建评论
 * @param {Object} param0 创建评论的数据 { blogId, userId, content }
 */
async function createComment({ blogId, userId, content }) {
    try {
        const comment = await createCommentService({
            blogId,
            userId,
            content: content
        })
        return new SuccessModel(comment)
    } catch (ex) {
        console.error(ex.message, ex.stack)
        return new ErrorModel(createCommentFailInfo)
    }
}

/**
 * 获取评论列表
 * @param {number} blogId 微博ID
 */
async function getComments(blogId) {
    const result = await getCommentsByBlogId(blogId)
    return new SuccessModel(result)
}

module.exports = {
    getBlogDetail,
    createComment,
    getComments
}
