/**
 * @description 转发服务
 * @author milk
 */

const { Blog, User, Repost, Comment, Collect, Like, At } = require('../db/model/index')
const { formatBlog, formatUser, formatComment } = require('./_format')
const { createAtReminder } = require('./at')
const { Op } = require('sequelize')
const { VISIBLE_TYPE } = require('../conf/visibleType')

const DEFAULT_WHERE = {
    deletedAt: null
}

/**
 * 创建微博（避免循环依赖，直接在本文件中实现）
 * @param {Object} param0 创建微博的数据 { userId, content, image, visibleType }
 */
async function createBlogDirect({ userId, content, image, visibleType = VISIBLE_TYPE.PUBLIC }) {
    const result = await Blog.create({
        userId,
        content,
        image,
        visibleType
    })
    return result.dataValues
}

/**
 * 检查用户是否已转发某条微博
 * @param {number} userId 用户ID
 * @param {number} blogId 微博ID
 */
async function hasReposted(userId, blogId) {
    const result = await Repost.findOne({
        where: {
            userId,
            sourceBlogId: blogId,
            ...DEFAULT_WHERE
        }
    })
    return result !== null
}

/**
 * 获取微博的转发数量
 * @param {number} blogId 微博ID
 * @param {boolean} includeAll 是否包含所有层级的转发（true 统计所有以该微博为源头的转发，false 只统计直接转发）
 */
async function getRepostCount(blogId, includeAll = true) {
    const whereOpt = {
        ...DEFAULT_WHERE
    }
    
    if (includeAll) {
        whereOpt.rootBlogId = blogId
    } else {
        whereOpt.sourceBlogId = blogId
    }
    
    const count = await Repost.count({
        where: whereOpt
    })
    return count
}

/**
 * 获取微博的转发列表
 * @param {number} blogId 微博ID
 * @param {number} pageIndex 页码
 * @param {number} pageSize 每页数量
 * @param {boolean} includeAll 是否包含所有层级的转发
 */
async function getRepostList(blogId, pageIndex = 0, pageSize = 10, includeAll = true) {
    const whereOpt = {
        ...DEFAULT_WHERE
    }
    
    if (includeAll) {
        whereOpt.rootBlogId = blogId
    } else {
        whereOpt.sourceBlogId = blogId
    }
    
    const result = await Repost.findAndCountAll({
        limit: pageSize,
        offset: pageSize * pageIndex,
        order: [['id', 'desc']],
        where: whereOpt,
        include: [
            {
                model: User,
                as: 'repostUser',
                attributes: ['id', 'userName', 'nickName', 'picture']
            },
            {
                model: Blog,
                as: 'repostBlog',
                include: [
                    {
                        model: User,
                        attributes: ['id', 'userName', 'nickName', 'picture']
                    }
                ]
            }
        ]
    })
    
    const repostList = result.rows.map(row => row.dataValues)
    
    return {
        count: result.count,
        repostList
    }
}

/**
 * 获取转发链路
 * @param {number} blogId 转发微博ID（新生成的微博ID）
 */
async function getRepostChain(blogId) {
    const repostRecord = await Repost.findOne({
        where: {
            blogId,
            ...DEFAULT_WHERE
        },
        include: [
            {
                model: Blog,
                as: 'sourceBlog',
                include: [
                    {
                        model: User,
                        attributes: ['id', 'userName', 'nickName', 'picture']
                    }
                ]
            },
            {
                model: Blog,
                as: 'rootBlog',
                include: [
                    {
                        model: User,
                        attributes: ['id', 'userName', 'nickName', 'picture']
                    }
                ]
            },
            {
                model: User,
                as: 'repostUser',
                attributes: ['id', 'userName', 'nickName', 'picture']
            }
        ]
    })
    
    if (!repostRecord) {
        return null
    }
    
    return repostRecord.dataValues
}

/**
 * 获取微博的完整转发信息（用于展示）
 * @param {number} blogId 微博ID
 */
async function getBlogWithRepostInfo(blogId) {
    const blog = await Blog.findOne({
        where: {
            id: blogId,
            ...DEFAULT_WHERE
        },
        include: [
            {
                model: User,
                attributes: ['id', 'userName', 'nickName', 'picture']
            }
        ]
    })
    
    if (!blog) {
        return null
    }
    
    const blogData = blog.dataValues
    blogData.user = formatUser(blogData.user.dataValues)
    
    const repostChain = await getRepostChain(blogId)
    
    let sourceBlog = null
    let rootBlog = null
    let repostLevel = 0
    let isRepost = false
    
    if (repostChain) {
        isRepost = true
        repostLevel = repostChain.repostLevel
        sourceBlog = repostChain.sourceBlog ? formatBlog(repostChain.sourceBlog.dataValues) : null
        rootBlog = repostChain.rootBlog ? formatBlog(repostChain.rootBlog.dataValues) : null
        
        if (sourceBlog) {
            sourceBlog.user = formatUser(sourceBlog.user.dataValues)
        }
        if (rootBlog) {
            rootBlog.user = formatUser(rootBlog.user.dataValues)
        }
    }
    
    const repostCount = await getRepostCount(blogId, true)
    const commentCount = await Comment.count({
        where: {
            blogId,
            ...DEFAULT_WHERE
        }
    })
    const likeCount = await Like.count({
        where: {
            blogId
        }
    })
    const collectCount = await Collect.count({
        where: {
            blogId
        }
    })
    
    return {
        ...formatBlog(blogData),
        isRepost,
        repostLevel,
        sourceBlog,
        rootBlog,
        repostCount,
        commentCount,
        likeCount,
        collectCount
    }
}

/**
 * 创建转发
 * @param {number} userId 转发者ID
 * @param {number} sourceBlogId 被转发的微博ID
 * @param {string} content 转发附带的评语
 */
async function createRepost(userId, sourceBlogId, content = '') {
    const sourceBlog = await Blog.findOne({
        where: {
            id: sourceBlogId,
            ...DEFAULT_WHERE
        },
        include: [
            {
                model: User,
                attributes: ['id', 'userName', 'nickName', 'picture']
            }
        ]
    })
    
    if (!sourceBlog) {
        return {
            success: false,
            message: '被转发的微博不存在'
        }
    }
    
    const hasRepostedBefore = await hasReposted(userId, sourceBlogId)
    if (hasRepostedBefore) {
        return {
            success: false,
            message: '您已经转发过这条微博了'
        }
    }
    
    let rootBlogId = sourceBlogId
    let rootUserId = sourceBlog.userId
    let repostLevel = 1
    let sourceUserId = sourceBlog.userId
    
    const existingRepost = await Repost.findOne({
        where: {
            blogId: sourceBlogId,
            ...DEFAULT_WHERE
        }
    })
    
    if (existingRepost) {
        rootBlogId = existingRepost.rootBlogId
        rootUserId = existingRepost.rootUserId
        repostLevel = existingRepost.repostLevel + 1
    }
    
    let newBlogContent = content || ''
    
    if (newBlogContent) {
        newBlogContent += '\n'
    }
    
    newBlogContent += `//@${sourceBlog.user.nickName || sourceBlog.user.userName}: ${sourceBlog.content}`
    
    const newBlog = await createBlogDirect({
        userId,
        content: newBlogContent,
        image: sourceBlog.image,
        visibleType: sourceBlog.visibleType
    })
    
    if (!newBlog) {
        return {
            success: false,
            message: '创建转发微博失败'
        }
    }
    
    await Repost.create({
        userId,
        blogId: newBlog.id,
        sourceBlogId,
        sourceUserId,
        rootBlogId,
        rootUserId,
        repostLevel
    })
    
    if (rootUserId !== userId) {
        try {
            await createAtReminder(rootUserId, [rootUserId], newBlog.id, null, 'blog')
        } catch (error) {
            console.error('创建转发通知失败:', error.message)
        }
    }
    
    return {
        success: true,
        data: {
            blog: newBlog,
            repostLevel,
            rootBlogId
        }
    }
}

/**
 * 取消转发
 * @param {number} userId 用户ID
 * @param {number} blogId 转发微博ID
 */
async function cancelRepost(userId, blogId) {
    const repostRecord = await Repost.findOne({
        where: {
            userId,
            blogId,
            ...DEFAULT_WHERE
        }
    })
    
    if (!repostRecord) {
        return {
            success: false,
            message: '转发记录不存在'
        }
    }
    
    await repostRecord.update({
        deletedAt: new Date()
    })
    
    const blog = await Blog.findOne({
        where: {
            id: blogId
        }
    })
    
    if (blog) {
        await blog.update({
            deletedAt: new Date()
        })
    }
    
    return {
        success: true
    }
}

/**
 * 批量获取微博的转发数量
 * @param {Array} blogIds 微博ID数组
 */
async function batchGetRepostCount(blogIds) {
    if (!blogIds || blogIds.length === 0) {
        return {}
    }
    
    const results = await Repost.findAll({
        attributes: ['rootBlogId', [Repost.sequelize.fn('COUNT', Repost.sequelize.col('id')), 'count']],
        where: {
            rootBlogId: {
                [Op.in]: blogIds
            },
            ...DEFAULT_WHERE
        },
        group: ['rootBlogId']
    })
    
    const countMap = {}
    for (const result of results) {
        const data = result.dataValues
        countMap[data.rootBlogId] = parseInt(data.count)
    }
    
    return countMap
}

module.exports = {
    hasReposted,
    getRepostCount,
    getRepostList,
    getRepostChain,
    getBlogWithRepostInfo,
    createRepost,
    cancelRepost,
    batchGetRepostCount
}
