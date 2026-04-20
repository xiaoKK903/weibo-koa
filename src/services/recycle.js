/**
 * @description 回收站 service
 * @author milk
 */

const { Blog, User, Collect, Like, Comment } = require('../db/model/index')
const { formatUser, formatBlog } = require('./_format')
const { Op } = require('sequelize')

async function softDeleteBlog(blogId, userId) {
    const blog = await Blog.findOne({
        where: {
            id: blogId,
            deletedAt: null
        }
    })
    
    if (!blog) {
        return { success: false, message: '微博不存在或已删除' }
    }
    
    if (blog.userId !== userId) {
        return { success: false, message: '无权限删除该微博' }
    }
    
    await blog.update({
        deletedAt: new Date()
    })
    
    return { success: true }
}

async function restoreBlog(blogId, userId) {
    const blog = await Blog.findOne({
        where: {
            id: blogId,
            deletedAt: {
                [Op.ne]: null
            }
        }
    })
    
    if (!blog) {
        return { success: false, message: '微博不存在或不在回收站中' }
    }
    
    if (blog.userId !== userId) {
        return { success: false, message: '无权限恢复该微博' }
    }
    
    await blog.update({
        deletedAt: null
    })
    
    return { success: true }
}

async function permanentDeleteBlog(blogId, userId) {
    const blog = await Blog.findOne({
        where: {
            id: blogId,
            deletedAt: {
                [Op.ne]: null
            }
        }
    })
    
    if (!blog) {
        return { success: false, message: '微博不存在或不在回收站中' }
    }
    
    if (blog.userId !== userId) {
        return { success: false, message: '无权限删除该微博' }
    }
    
    await Comment.destroy({
        where: { blogId }
    })
    
    await Collect.destroy({
        where: { blogId }
    })
    
    await Like.destroy({
        where: { blogId }
    })
    
    await Blog.destroy({
        where: { id: blogId }
    })
    
    return { success: true }
}

async function getRecycleList(userId, pageIndex = 0, pageSize = 10) {
    const result = await Blog.findAndCountAll({
        limit: pageSize,
        offset: pageSize * pageIndex,
        order: [
            ['deletedAt', 'desc']
        ],
        where: {
            userId,
            deletedAt: {
                [Op.ne]: null
            }
        },
        include: [
            {
                model: User,
                attributes: ['userName', 'nickName', 'picture']
            }
        ]
    })
    
    let blogList = result.rows.map(row => row.dataValues)
    
    blogList = formatBlog(blogList)
    
    blogList = await Promise.all(blogList.map(async (blogItem) => {
        const user = blogItem.user.dataValues
        blogItem.user = formatUser(user)
        
        const collectCount = await Collect.count({
            where: { blogId: blogItem.id }
        })
        
        const likeCount = await Like.count({
            where: { blogId: blogItem.id }
        })
        
        return {
            ...blogItem,
            collectCount,
            likeCount
        }
    }))
    
    return {
        count: result.count,
        blogList
    }
}

async function getBlogByIdWithDeleted(blogId, userId = null) {
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
    
    const blog = result.dataValues
    const formattedBlog = formatBlog(blog)
    formattedBlog.user = formatUser(formattedBlog.user.dataValues)
    
    const collectCount = await Collect.count({
        where: { blogId }
    })
    
    let isCollected = false
    if (userId) {
        const collect = await Collect.findOne({
            where: { userId, blogId }
        })
        isCollected = !!collect
    }
    
    const likeCount = await Like.count({
        where: { blogId }
    })
    
    let isLiked = false
    if (userId) {
        const like = await Like.findOne({
            where: { userId, blogId }
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

async function clearAllRecycle(userId) {
    const deletedBlogs = await Blog.findAll({
        where: {
            userId,
            deletedAt: {
                [Op.ne]: null
            }
        },
        attributes: ['id']
    })
    
    const blogIds = deletedBlogs.map(b => b.id)
    
    if (blogIds.length === 0) {
        return { success: true, deletedCount: 0 }
    }
    
    await Comment.destroy({
        where: { blogId: { [Op.in]: blogIds } }
    })
    
    await Collect.destroy({
        where: { blogId: { [Op.in]: blogIds } }
    })
    
    await Like.destroy({
        where: { blogId: { [Op.in]: blogIds } }
    })
    
    const deletedCount = await Blog.destroy({
        where: { id: { [Op.in]: blogIds } }
    })
    
    return { success: true, deletedCount }
}

module.exports = {
    softDeleteBlog,
    restoreBlog,
    permanentDeleteBlog,
    getRecycleList,
    getBlogByIdWithDeleted,
    clearAllRecycle
}
