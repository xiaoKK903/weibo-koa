/**
 * @description 微博 service
 * @author milk
 */

const { Blog, User, UserRelation, Comment, Collect, Like } = require('../db/model/index')
const { formatUser, formatBlog } = require('./_format')
const { timeFormat } = require('../utils/dt')
const { Op } = require('sequelize')

/**
 * 创建微博
 * @param {Object} param0 创建微博的数据 { userId, content, image }
 */
async function createBlog({ userId, content, image }) {
    const result = await Blog.create({
        userId,
        content,
        image
    })
    return result.dataValues
}

/**
 * 根据用户获取微博列表
 * @param {Object} param0 查询参数 { userName, pageIndex = 0, pageSize = 10, userId, keyword }
 */
async function getBlogListByUser(
    { userName, pageIndex = 0, pageSize = 10, userId, keyword }
) {
    // 拼接查询条件
    const userWhereOpts = {}
    if (userName) {
        userWhereOpts.userName = userName
    }

    // 搜索条件
    const blogWhereOpts = {}
    if (keyword) {
        blogWhereOpts.content = {
            [Symbol.for('like')]: `%${keyword}%`
        }
    }

    // 执行查询
    const result = await Blog.findAndCountAll({
        limit: pageSize, // 每页多少条
        offset: pageSize * pageIndex, // 跳过多少条
        order: [
            ['id', 'desc']
        ],
        where: blogWhereOpts,
        include: [
            {
                model: User,
                attributes: ['userName', 'nickName', 'picture'],
                where: userWhereOpts
            }
        ]
    })
    // result.count 总数，跟分页无关
    // result.rows 查询结果，数组

    // 获取 dataValues
    let blogList = result.rows.map(row => row.dataValues)

    // 格式化
    blogList = formatBlog(blogList)
    blogList = blogList.map(blogItem => {
        const user = blogItem.user.dataValues
        blogItem.user = formatUser(user)
        return blogItem
    })

    // 添加收藏状态和收藏数、点赞状态和点赞数
    blogList = await Promise.all(blogList.map(async (blogItem) => {
        // 获取收藏数
        const collectCount = await Collect.count({
            where: {
                blogId: blogItem.id
            }
        })
        
        // 检查当前用户是否收藏
        let isCollected = false
        if (userId) {
            const collect = await Collect.findOne({
                where: {
                    userId,
                    blogId: blogItem.id
                }
            })
            isCollected = !!collect
        }

        // 获取点赞数
        const likeCount = await Like.count({
            where: {
                blogId: blogItem.id
            }
        })
        
        // 检查当前用户是否点赞
        let isLiked = false
        if (userId) {
            const like = await Like.findOne({
                where: {
                    userId,
                    blogId: blogItem.id
                }
            })
            isLiked = !!like
        }
        
        return {
            ...blogItem,
            collectCount,
            isCollected,
            likeCount,
            isLiked
        }
    }))

    return {
        count: result.count,
        blogList
    }
}

/**
 * 获取微博列表（首页）
 * @param {Object} param0 查询条件 { userId, pageIndex = 0, pageSize = 10 }
 */
async function getFollowersBlogList({ userId, pageIndex = 0, pageSize = 10 }) {
    const result = await Blog.findAndCountAll({
        limit: pageSize, // 每页多少条
        offset: pageSize * pageIndex, // 跳过多少条
        order: [
            ['id', 'desc']
        ],
        include: [
            {
                model: User,
                attributes: ['userName', 'nickName', 'picture']
            }
        ]
    })

    // 格式化数据
    let blogList = result.rows.map(row => row.dataValues)
    blogList = formatBlog(blogList)
    blogList = blogList.map(blogItem => {
        blogItem.user = formatUser(blogItem.user.dataValues)
        return blogItem
    })

    // 添加收藏状态和收藏数、点赞状态和点赞数
    blogList = await Promise.all(blogList.map(async (blogItem) => {
        // 获取收藏数
        const collectCount = await Collect.count({
            where: {
                blogId: blogItem.id
            }
        })
        
        // 检查当前用户是否收藏
        let isCollected = false
        if (userId) {
            const collect = await Collect.findOne({
                where: {
                    userId,
                    blogId: blogItem.id
                }
            })
            isCollected = !!collect
        }

        // 获取点赞数
        const likeCount = await Like.count({
            where: {
                blogId: blogItem.id
            }
        })
        
        // 检查当前用户是否点赞
        let isLiked = false
        if (userId) {
            const like = await Like.findOne({
                where: {
                    userId,
                    blogId: blogItem.id
                }
            })
            isLiked = !!like
        }
        
        return {
            ...blogItem,
            collectCount,
            isCollected,
            likeCount,
            isLiked
        }
    }))

    return {
        count: result.count,
        blogList
    }
}

/**
 * 根据ID获取微博详情
 * @param {number} blogId 微博ID
 * @param {number} userId 当前用户ID
 */
async function getBlogById(blogId, userId = null) {
    const result = await Blog.findOne({
        where: {
            id: blogId
        },
        include: [
            {
                model: User,
                attributes: ['userName', 'nickName', 'picture']
            }
        ]
    })

    if (!result) {
        return null
    }

    // 格式化
    const blog = result.dataValues
    const formattedBlog = formatBlog(blog)
    formattedBlog.user = formatUser(formattedBlog.user.dataValues)

    // 添加收藏状态和收藏数
    // 获取收藏数
    const collectCount = await Collect.count({
        where: {
            blogId: blogId
        }
    })
    
    // 检查当前用户是否收藏
    let isCollected = false
    if (userId) {
        const collect = await Collect.findOne({
            where: {
                userId,
                blogId: blogId
            }
        })
        isCollected = !!collect
    }

    // 添加点赞状态和点赞数
    // 获取点赞数
    const likeCount = await Like.count({
        where: {
            blogId: blogId
        }
    })
    
    // 检查当前用户是否点赞
    let isLiked = false
    if (userId) {
        const like = await Like.findOne({
            where: {
                userId,
                blogId: blogId
            }
        })
        isLiked = !!like
    }
    
    return {
        ...formattedBlog,
        collectCount,
        isCollected,
        likeCount,
        isLiked
    }
}

/**
 * 创建评论
 * @param {Object} param0 创建评论的数据 { blogId, userId, content, parentId, replyUserId }
 */
async function createComment({ blogId, userId, content, parentId = null, replyUserId = null }) {
    let rootId = null
    
    if (parentId) {
        const parentComment = await Comment.findOne({
            where: {
                id: parentId,
                isDeleted: false
            }
        })
        
        if (parentComment) {
            rootId = parentComment.rootId || parentComment.id
        }
    }
    
    const result = await Comment.create({
        blogId,
        userId,
        content,
        parentId,
        replyUserId,
        rootId
    })
    return result.dataValues
}

/**
 * 根据微博ID获取评论列表（嵌套结构）
 * @param {number} blogId 微博ID
 * @param {number} userId 当前用户ID（用于判断点赞状态）
 */
async function getCommentsByBlogId(blogId, userId = null) {
    const result = await Comment.findAndCountAll({
        where: {
            blogId,
            isDeleted: false
        },
        order: [
            ['id', 'asc']
        ],
        include: [
            {
                model: User,
                attributes: ['userName', 'nickName', 'picture']
            },
            {
                model: User,
                as: 'replyUser',
                attributes: ['userName', 'nickName', 'picture']
            }
        ]
    })

    let commentList = result.rows.map(row => row.dataValues)
    
    commentList = await Promise.all(commentList.map(async commentItem => {
        commentItem.user = formatUser(commentItem.user.dataValues)
        
        if (commentItem.replyUser) {
            commentItem.replyUser = formatUser(commentItem.replyUser.dataValues)
        }
        
        commentItem.createdAtFormat = timeFormat(commentItem.createdAt)
        
        const likeCount = await Like.count({
            where: {
                commentId: commentItem.id
            }
        })
        
        let isLiked = false
        if (userId) {
            const like = await Like.findOne({
                where: {
                    userId,
                    commentId: commentItem.id
                }
            })
            isLiked = !!like
        }
        
        commentItem.likeCount = likeCount
        commentItem.isLiked = isLiked
        
        return commentItem
    }))
    
    const nestedComments = buildNestedComments(commentList)

    return {
        count: result.count,
        commentList: nestedComments
    }
}

/**
 * 构建嵌套评论结构
 * @param {Array} comments 扁平评论列表
 */
function buildNestedComments(comments) {
    const commentMap = new Map()
    const rootComments = []
    
    comments.forEach(comment => {
        comment.children = []
        commentMap.set(comment.id, comment)
    })
    
    comments.forEach(comment => {
        if (comment.parentId) {
            const parent = commentMap.get(comment.parentId)
            if (parent) {
                parent.children.push(comment)
            }
        } else {
            rootComments.push(comment)
        }
    })
    
    return rootComments
}

/**
 * 根据ID获取单个评论
 * @param {number} commentId 评论ID
 */
async function getCommentById(commentId) {
    const result = await Comment.findOne({
        where: {
            id: commentId,
            isDeleted: false
        },
        include: [
            {
                model: User,
                attributes: ['userName', 'nickName', 'picture']
            },
            {
                model: User,
                as: 'replyUser',
                attributes: ['userName', 'nickName', 'picture']
            }
        ]
    })
    
    if (!result) {
        return null
    }
    
    const comment = result.dataValues
    comment.user = formatUser(comment.user.dataValues)
    
    if (comment.replyUser) {
        comment.replyUser = formatUser(comment.replyUser.dataValues)
    }
    
    comment.createdAtFormat = timeFormat(comment.createdAt)
    
    return comment
}

/**
 * 删除评论（软删除）
 * @param {number} commentId 评论ID
 * @param {number} userId 用户ID（用于权限校验）
 */
async function deleteComment(commentId, userId) {
    const comment = await Comment.findOne({
        where: {
            id: commentId,
            isDeleted: false
        }
    })
    
    if (!comment) {
        return { success: false, message: '评论不存在' }
    }
    
    if (comment.userId !== userId) {
        return { success: false, message: '无权限删除该评论' }
    }
    
    await comment.update({ isDeleted: true })
    
    return { success: true }
}

/**
 * 点赞评论
 * @param {number} commentId 评论ID
 * @param {number} userId 用户ID
 */
async function likeComment(commentId, userId) {
    const comment = await Comment.findOne({
        where: {
            id: commentId,
            isDeleted: false
        }
    })
    
    if (!comment) {
        return { success: false, message: '评论不存在' }
    }
    
    const existingLike = await Like.findOne({
        where: {
            userId,
            commentId
        }
    })
    
    if (existingLike) {
        return { success: false, message: '已经点赞过了' }
    }
    
    await Like.create({
        userId,
        commentId
    })
    
    return { success: true }
}

/**
 * 取消点赞评论
 * @param {number} commentId 评论ID
 * @param {number} userId 用户ID
 */
async function unlikeComment(commentId, userId) {
    const result = await Like.destroy({
        where: {
            userId,
            commentId
        }
    })
    
    return { success: result > 0 }
}

module.exports = {
    createBlog,
    getBlogListByUser,
    getFollowersBlogList,
    getBlogById,
    createComment,
    getCommentsByBlogId,
    getCommentById,
    deleteComment,
    likeComment,
    unlikeComment
}
