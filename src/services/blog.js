/**
 * @description 微博 service
 * @author milk
 */

const { Blog, User, UserRelation, Comment, Collect, Like } = require('../db/model/index')
const { formatUser, formatBlog } = require('./_format')
const { timeFormat } = require('../utils/dt')
const { Op } = require('sequelize')
const { VISIBLE_TYPE, getVisibleTypeInfo } = require('../conf/visibleType')
const { checkFollowStatus } = require('./follow')
const { checkBlockStatus, checkIsBlockedBy } = require('./block')

const DEFAULT_WHERE = {
    deletedAt: null
}

/**
 * 检查用户是否有权限查看微博
 * @param {Object} blog 微博对象
 * @param {number} currentUserId 当前用户ID
 */
async function canViewBlog(blog, currentUserId = null) {
    if (!blog) {
        return false
    }
    
    const visibleType = blog.visibleType !== undefined ? blog.visibleType : VISIBLE_TYPE.PUBLIC
    const blogUserId = blog.userId
    
    if (currentUserId) {
        const isBlocked = await checkBlockStatus(currentUserId, blogUserId)
        if (isBlocked) {
            return false
        }
        
        const isBlockedBy = await checkIsBlockedBy(currentUserId, blogUserId)
        if (isBlockedBy) {
            return false
        }
    }
    
    if (visibleType === VISIBLE_TYPE.PUBLIC) {
        return true
    }
    
    if (visibleType === VISIBLE_TYPE.PRIVATE) {
        return currentUserId !== null && currentUserId === blogUserId
    }
    
    if (visibleType === VISIBLE_TYPE.FANS_ONLY) {
        if (currentUserId === blogUserId) {
            return true
        }
        if (!currentUserId) {
            return false
        }
        try {
            const isFollowing = await checkFollowStatus(currentUserId, blogUserId)
            return isFollowing
        } catch (error) {
            console.error('检查关注状态失败:', error)
            return false
        }
    }
    
    return true
}

/**
 * 构建可见权限的查询条件
 * @param {number} currentUserId 当前用户ID
 * @param {number} targetUserId 目标用户ID（可选，用于个人主页查询）
 */
async function buildVisibleWhere(currentUserId = null, targetUserId = null) {
    const whereClauses = []
    
    whereClauses.push({
        visibleType: VISIBLE_TYPE.PUBLIC
    })
    
    if (currentUserId) {
        if (currentUserId === targetUserId) {
            return {
                [Op.or]: [
                    { visibleType: VISIBLE_TYPE.PUBLIC },
                    { visibleType: VISIBLE_TYPE.PRIVATE },
                    { visibleType: VISIBLE_TYPE.FANS_ONLY }
                ]
            }
        }
        
        whereClauses.push({
            userId: currentUserId,
            visibleType: {
                [Op.in]: [VISIBLE_TYPE.PRIVATE, VISIBLE_TYPE.FANS_ONLY]
            }
        })
        
        whereClauses.push({
            visibleType: VISIBLE_TYPE.FANS_ONLY,
            userId: {
                [Op.ne]: currentUserId
            }
        })
    }
    
    return {
        [Op.or]: whereClauses
    }
}

/**
 * 创建微博
 * @param {Object} param0 创建微博的数据 { userId, content, image, visibleType }
 */
async function createBlog({ userId, content, image, visibleType = VISIBLE_TYPE.PUBLIC }) {
    const result = await Blog.create({
        userId,
        content,
        image,
        visibleType
    })
    return result.dataValues
}

/**
 * 更新微博可见权限
 * @param {number} blogId 微博ID
 * @param {number} userId 用户ID
 * @param {number} visibleType 可见权限类型
 */
async function updateBlogVisibleType(blogId, userId, visibleType) {
    const blog = await Blog.findOne({
        where: {
            id: blogId,
            ...DEFAULT_WHERE
        }
    })
    
    if (!blog) {
        return { success: false, message: '微博不存在' }
    }
    
    if (blog.userId !== userId) {
        return { success: false, message: '无权限修改该微博' }
    }
    
    if (!Object.values(VISIBLE_TYPE).includes(visibleType)) {
        return { success: false, message: '无效的可见权限类型' }
    }
    
    await blog.update({ visibleType })
    
    return { success: true, visibleType }
}

/**
 * 根据用户获取微博列表
 * @param {Object} param0 查询参数 { userName, pageIndex = 0, pageSize = 10, userId, keyword, currentUserId }
 */
async function getBlogListByUser(
    { userName, pageIndex = 0, pageSize = 10, userId, keyword, currentUserId }
) {
    const userWhereOpts = {}
    if (userName) {
        userWhereOpts.userName = userName
    }

    const blogWhereOpts = {
        ...DEFAULT_WHERE
    }
    if (keyword) {
        blogWhereOpts.content = {
            [Symbol.for('like')]: `%${keyword}%`
        }
    }

    const result = await Blog.findAndCountAll({
        limit: pageSize,
        offset: pageSize * pageIndex,
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

    let blogList = result.rows.map(row => row.dataValues)

    blogList = formatBlog(blogList)
    blogList = blogList.map(blogItem => {
        const user = blogItem.user.dataValues
        blogItem.user = formatUser(user)
        return blogItem
    })

    const filteredBlogList = []
    for (const blogItem of blogList) {
        const canView = await canViewBlog(blogItem, currentUserId)
        if (canView) {
            filteredBlogList.push(blogItem)
        }
    }

    const blogListWithExtra = await Promise.all(filteredBlogList.map(async (blogItem) => {
        const collectCount = await Collect.count({
            where: {
                blogId: blogItem.id
            }
        })
        
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

        const likeCount = await Like.count({
            where: {
                blogId: blogItem.id
            }
        })
        
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
        count: blogListWithExtra.length,
        blogList: blogListWithExtra
    }
}

/**
 * 获取微博列表（首页）
 * @param {Object} param0 查询条件 { userId, pageIndex = 0, pageSize = 10 }
 */
async function getFollowersBlogList({ userId, pageIndex = 0, pageSize = 10 }) {
    const result = await Blog.findAndCountAll({
        limit: pageSize,
        offset: pageSize * pageIndex,
        order: [
            ['id', 'desc']
        ],
        where: DEFAULT_WHERE,
        include: [
            {
                model: User,
                attributes: ['userName', 'nickName', 'picture']
            }
        ]
    })

    let blogList = result.rows.map(row => row.dataValues)
    blogList = formatBlog(blogList)
    blogList = blogList.map(blogItem => {
        blogItem.user = formatUser(blogItem.user.dataValues)
        return blogItem
    })

    const filteredBlogList = []
    for (const blogItem of blogList) {
        const canView = await canViewBlog(blogItem, userId)
        if (canView) {
            filteredBlogList.push(blogItem)
        }
    }

    const blogListWithExtra = await Promise.all(filteredBlogList.map(async (blogItem) => {
        const collectCount = await Collect.count({
            where: {
                blogId: blogItem.id
            }
        })
        
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

        const likeCount = await Like.count({
            where: {
                blogId: blogItem.id
            }
        })
        
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
        count: blogListWithExtra.length,
        blogList: blogListWithExtra
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
            id: blogId,
            ...DEFAULT_WHERE
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

    const blog = result.dataValues

    const canView = await canViewBlog(blog, userId)
    if (!canView) {
        return null
    }

    const formattedBlog = formatBlog(blog)
    formattedBlog.user = formatUser(formattedBlog.user.dataValues)

    const collectCount = await Collect.count({
        where: {
            blogId: blogId
        }
    })
    
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

    const likeCount = await Like.count({
        where: {
            blogId: blogId
        }
    })
    
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
    
    if (userId) {
        const filteredCommentList = []
        for (const commentItem of commentList) {
            const commentUserId = commentItem.userId
            
            const isBlocked = await checkBlockStatus(userId, commentUserId)
            if (isBlocked) {
                continue
            }
            
            const isBlockedBy = await checkIsBlockedBy(userId, commentUserId)
            if (isBlockedBy) {
                continue
            }
            
            filteredCommentList.push(commentItem)
        }
        commentList = filteredCommentList
    }
    
    const nestedComments = buildNestedComments(commentList)

    return {
        count: commentList.length,
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
    unlikeComment,
    canViewBlog,
    updateBlogVisibleType
}