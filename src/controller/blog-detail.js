/**
 * @description 微博详情页 controller
 * @author milk
 */

const { 
    getBlogById, 
    createComment: createCommentService, 
    getCommentsByBlogId,
    getCommentById,
    deleteComment: deleteCommentService,
    likeComment: likeCommentService,
    unlikeComment: unlikeCommentService
} = require('../services/blog')
const { SuccessModel, ErrorModel } = require('../model/ResModel')
const { blogNotExistInfo, createCommentFailInfo, duplicateContentInfo, sensitiveContentInfo } = require('../model/ErrorInfo')
const { REG_FOR_AT_WHO } = require('../conf/constant')
const { getUserInfo } = require('../services/user')
const { createAtReminder } = require('../services/at')
const xss = require('xss')
const { contentSecurityCheck } = require('../middlewares/contentSecurity')

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
 * 创建评论（支持楼中楼回复）
 * @param {Object} param0 创建评论的数据 { blogId, userId, content, parentId, replyUserId }
 */
async function createComment({ blogId, userId, content, parentId = null, replyUserId = null }) {
    const securityCheck = await contentSecurityCheck(userId, content, 'comment', parentId);
    
    if (!securityCheck.pass) {
        if (securityCheck.errorType === 'sensitive') {
            return new ErrorModel(sensitiveContentInfo);
        }
        if (securityCheck.errorType === 'duplicate') {
            return new ErrorModel(duplicateContentInfo);
        }
    }

    try {
        const atUserNameList = [];
        content = content.replace(REG_FOR_AT_WHO, (matchStr, nickName, userName1, userName2) => {
            const userName = userName1 || userName2;
            if (userName) {
                atUserNameList.push(userName);
            }
            return matchStr;
        });

        const atUserList = await Promise.all(
            atUserNameList.map((userName) => getUserInfo(userName)),
        );

        const atUserIdList = atUserList.filter(user => user).map((user) => user.id);

        const comment = await createCommentService({
            blogId,
            userId,
            content: content,
            parentId,
            replyUserId
        })

        if (atUserIdList.length > 0) {
            await createAtReminder(userId, atUserIdList, blogId, comment.id, 'comment');
        }

        if (replyUserId && replyUserId !== userId && !atUserIdList.includes(replyUserId)) {
            await createAtReminder(userId, [replyUserId], blogId, comment.id, 'comment');
        }

        const fullComment = await getCommentById(comment.id)

        return new SuccessModel(fullComment)
    } catch (ex) {
        console.error(ex.message, ex.stack)
        return new ErrorModel(createCommentFailInfo)
    }
}

/**
 * 获取评论列表
 * @param {number} blogId 微博ID
 * @param {number} userId 当前用户ID
 */
async function getComments(blogId, userId = null) {
    const result = await getCommentsByBlogId(blogId, userId)
    return new SuccessModel(result)
}

/**
 * 删除评论
 * @param {number} commentId 评论ID
 * @param {number} userId 用户ID
 */
async function deleteComment(commentId, userId) {
    const result = await deleteCommentService(commentId, userId)
    if (result.success) {
        return new SuccessModel({ message: '删除成功' })
    } else {
        return new ErrorModel({ errno: 400, message: result.message || '删除失败' })
    }
}

/**
 * 点赞评论
 * @param {number} commentId 评论ID
 * @param {number} userId 用户ID
 */
async function likeComment(commentId, userId) {
    const result = await likeCommentService(commentId, userId)
    if (result.success) {
        return new SuccessModel({ message: '点赞成功' })
    } else {
        return new ErrorModel({ errno: 400, message: result.message || '点赞失败' })
    }
}

/**
 * 取消点赞评论
 * @param {number} commentId 评论ID
 * @param {number} userId 用户ID
 */
async function unlikeComment(commentId, userId) {
    const result = await unlikeCommentService(commentId, userId)
    if (result.success) {
        return new SuccessModel({ message: '取消点赞成功' })
    } else {
        return new ErrorModel({ errno: 400, message: '取消点赞失败' })
    }
}

module.exports = {
    getBlogDetail,
    createComment,
    getComments,
    deleteComment,
    likeComment,
    unlikeComment
}
