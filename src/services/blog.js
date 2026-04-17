/**
 * @description 微博 service
 * @author milk
 */

const { Blog, User, UserRelation, Comment, Collect } = require('../db/model/index')
const { formatUser, formatBlog } = require('./_format')
const { timeFormat } = require('../utils/dt')

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
 * @param {Object} param0 查询参数 { userName, pageIndex = 0, pageSize = 10, userId }
 */
async function getBlogListByUser(
    { userName, pageIndex = 0, pageSize = 10, userId }
) {
    // 拼接查询条件
    const userWhereOpts = {}
    if (userName) {
        userWhereOpts.userName = userName
    }

    // 执行查询
    const result = await Blog.findAndCountAll({
        limit: pageSize, // 每页多少条
        offset: pageSize * pageIndex, // 跳过多少条
        order: [
            ['id', 'desc']
        ],
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

    // 添加收藏状态和收藏数
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
        
        return {
            ...blogItem,
            collectCount,
            isCollected
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

    // 添加收藏状态和收藏数
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
        
        return {
            ...blogItem,
            collectCount,
            isCollected
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
    
    return {
        ...formattedBlog,
        collectCount,
        isCollected
    }
}

/**
 * 创建评论
 * @param {Object} param0 创建评论的数据 { blogId, userId, content }
 */
async function createComment({ blogId, userId, content }) {
    const result = await Comment.create({
        blogId,
        userId,
        content
    })
    return result.dataValues
}

/**
 * 根据微博ID获取评论列表
 * @param {number} blogId 微博ID
 */
async function getCommentsByBlogId(blogId) {
    const result = await Comment.findAndCountAll({
        where: {
            blogId
        },
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
    let commentList = result.rows.map(row => row.dataValues)
    commentList = commentList.map(commentItem => {
        commentItem.user = formatUser(commentItem.user.dataValues)
        commentItem.createdAtFormat = timeFormat(commentItem.createdAt)
        return commentItem
    })

    return {
        count: result.count,
        commentList
    }
}

module.exports = {
    createBlog,
    getBlogListByUser,
    getFollowersBlogList,
    getBlogById,
    createComment,
    getCommentsByBlogId
}
