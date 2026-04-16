/**
 * @description 微博详情页 controller
 * @author milk
 */

const { getBlogById } = require('../services/blog')
const { SuccessModel, ErrorModel } = require('../model/ResModel')
const { blogNotExistInfo } = require('../model/ErrorInfo')

/**
 * 获取微博详情
 * @param {number} blogId 微博ID
 */
async function getBlogDetail(blogId) {
    const blog = await getBlogById(blogId)
    if (!blog) {
        return new ErrorModel(blogNotExistInfo)
    }
    return new SuccessModel(blog)
}

module.exports = {
    getBlogDetail
}
