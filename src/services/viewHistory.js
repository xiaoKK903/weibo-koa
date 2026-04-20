/**
 * @description 浏览历史 service
 * @author milk
 */

const { ViewHistory, Blog, User, Collect, Like } = require('../db/model/index')
const { formatUser, formatBlog } = require('./_format')
const { Op } = require('sequelize')

async function addViewHistory(userId, blogId) {
    try {
        const existing = await ViewHistory.findOne({
            where: { userId, blogId }
        })
        
        if (existing) {
            await existing.update({
                updatedAt: new Date()
            })
        } else {
            await ViewHistory.create({
                userId,
                blogId
            })
        }
        return { success: true }
    } catch (err) {
        console.error('添加浏览历史失败:', err)
        return { success: false, message: err.message }
    }
}

async function getViewHistoryList(userId, pageIndex = 0, pageSize = 10) {
    const result = await ViewHistory.findAndCountAll({
        limit: pageSize,
        offset: pageSize * pageIndex,
        order: [
            ['updatedAt', 'desc'],
            ['createdAt', 'desc']
        ],
        where: { userId },
        include: [
            {
                model: Blog,
                attributes: ['id', 'content', 'image', 'userId', 'createdAt', 'updatedAt'],
                include: [
                    {
                        model: User,
                        attributes: ['userName', 'nickName', 'picture']
                    }
                ]
            }
        ]
    })
    
    const validHistories = []
    for (const row of result.rows) {
        const history = row.dataValues
        
        if (history.blog) {
            let blog = history.blog.dataValues
            
            if (blog.user) {
                blog.user = formatUser(blog.user.dataValues)
            }
            
            blog = formatBlog(blog)
            
            const collectCount = await Collect.count({
                where: { blogId: blog.id }
            })
            
            let isCollected = false
            if (userId) {
                const collect = await Collect.findOne({
                    where: { userId, blogId: blog.id }
                })
                isCollected = !!collect
            }
            
            const likeCount = await Like.count({
                where: { blogId: blog.id }
            })
            
            let isLiked = false
            if (userId) {
                const like = await Like.findOne({
                    where: { userId, blogId: blog.id }
                })
                isLiked = !!like
            }
            
            validHistories.push({
                id: history.id,
                userId: history.userId,
                blogId: history.blogId,
                createdAt: history.createdAt,
                updatedAt: history.updatedAt,
                blog: {
                    ...blog,
                    collectCount,
                    isCollected,
                    likeCount,
                    isLiked
                }
            })
        }
    }
    
    return {
        count: result.count,
        validCount: validHistories.length,
        historyList: validHistories
    }
}

async function deleteViewHistory(id, userId) {
    const result = await ViewHistory.destroy({
        where: { id, userId }
    })
    return { success: result > 0 }
}

async function clearAllViewHistory(userId) {
    const result = await ViewHistory.destroy({
        where: { userId }
    })
    return { success: true, deletedCount: result }
}

module.exports = {
    addViewHistory,
    getViewHistoryList,
    deleteViewHistory,
    clearAllViewHistory
}
