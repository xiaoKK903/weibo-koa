/**
 * @description 收藏控制器
 * @author milk
 */

const { collectBlog, cancelCollect, getCollectedBlogList, isCollected, getCollectCount } = require('../services/collect')
const { SuccessModel, ErrorModel } = require('../model/ResModel')

/**
 * 收藏微博
 * @param {Object} ctx ctx
 * @param {number} blogId 微博ID
 */
async function collect(ctx, blogId) {
    const { id: userId } = ctx.session.userInfo
    const result = await collectBlog(userId, blogId)

    if (!result) {
        return new ErrorModel({ errno: 12001, message: '已经收藏过该微博' })
    }

    return new SuccessModel({ collectId: result.id })
}

/**
 * 取消收藏微博
 * @param