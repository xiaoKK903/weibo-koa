/**
 * @description 微博详情页 controller
 * @author milk
 */

const { getBlogById, createComment: createCommentService, getCommentsByBlogId } = require('../services/blog')
const { SuccessModel, ErrorModel } = require('../model/ResModel')
const { blogNotExistInfo, createCommentFailInfo } = require('../model/ErrorInfo')
const { REG_FOR_AT_WHO } = require('../conf/constant')
const { getUserInfo } = require('../services/user')
const { createAtReminder } = require('../services/at')
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
        // 分析并收集 content 中的 @ 用户
        // 支持两种格式：
        // 1. '@昵称 - userName' 格式，如 '哈喽 @李四 - lisi 你好'
        // 2. '@userName' 格式，如 '哈喽 @lisi 你好'
        const atUserNameList = [];
        content = content.replace(REG_FOR_AT_WHO, (matchStr, nickName, userName1, userName2) => {
            // 目的不是 replace 而是获取 userName
            // 如果是第一种格式，userName1 有值
            // 如果是第二种格式，userName2 有值
            const userName = userName1 || userName2;
            if (userName) {
                atUserNameList.push(userName);
            }
            return matchStr; // 替换不生效，预期
        });

        // 根据 @ 用户名查询用户信息
        const atUserList = await Promise.all(
            atUserNameList.map((userName) => getUserInfo(userName)),
        );

        // 根据用户信息，获取用户 id
        const atUserIdList = atUserList.filter(user => user).map((user) => user.id);

        // 创建评论
        const comment = await createCommentService({
            blogId,
            userId,
            content: content
        })

        // 创建 @提醒
        if (atUserIdList.length > 0) {
            await createAtReminder(userId, atUserIdList, blogId, comment.id, 'comment');
        }

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
