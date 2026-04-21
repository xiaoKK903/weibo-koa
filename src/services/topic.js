/**
 * @description 话题服务
 * @author milk
 */

const { Topic, BlogTopic, Blog, User, Like, Collect, Repost, Comment } = require('../db/model/index')
const { formatBlog, formatUser, formatComment } = require('./_format')
const { Op } = require('sequelize')

const DEFAULT_WHERE = {
    deletedAt: null
}

/**
 * 从内容中提取话题
 * @param {string} content 微博内容
 * @returns {Array} 话题名称数组（不包含 # 符号）
 */
function extractTopics(content) {
    if (!content) {
        return []
    }
    
    const regex = /#([^#\s]+)(?:#)?/g
    const matches = []
    let match
    
    while ((match = regex.exec(content)) !== null) {
        const topicName = match[1].trim()
        if (topicName && topicName.length > 0 && topicName.length <= 100) {
            if (!matches.includes(topicName)) {
                matches.push(topicName)
            }
        }
    }
    
    return matches
}

/**
 * 获取话题（如果不存在则创建）
 * @param {string} topicName 话题名称
 * @returns {Object} 话题对象
 */
async function getOrCreateTopic(topicName) {
    const [topic, created] = await Topic.findOrCreate({
        where: {
            name: topicName,
            ...DEFAULT_WHERE
        },
        defaults: {
            name: topicName,
            blogCount: 0,
            lastActivityAt: new Date()
        }
    })
    
    return topic.dataValues
}

/**
 * 将微博与话题关联
 * @param {number} blogId 微博 ID
 * @param {Array} topicNames 话题名称数组
 */
async function associateBlogWithTopics(blogId, topicNames) {
    if (!topicNames || topicNames.length === 0) {
        return
    }
    
    for (const topicName of topicNames) {
        const topic = await getOrCreateTopic(topicName)
        
        const [association, created] = await BlogTopic.findOrCreate({
            where: {
                blogId,
                topicId: topic.id,
                ...DEFAULT_WHERE
            }
        })
        
        if (created) {
            await Topic.increment('blogCount', {
                where: {
                    id: topic.id
                }
            })
            
            await Topic.update({
                lastActivityAt: new Date()
            }, {
                where: {
                    id: topic.id
                }
            })
        }
    }
}

/**
 * 解除微博与话题的关联
 * @param {number} blogId 微博 ID
 */
async function disassociateBlogFromTopics(blogId) {
    const associations = await BlogTopic.findAll({
        where: {
            blogId,
            ...DEFAULT_WHERE
        }
    })
    
    for (const association of associations) {
        await BlogTopic.destroy({
            where: {
                id: association.id
            }
        })
        
        await Topic.decrement('blogCount', {
            where: {
                id: association.topicId
            }
        })
    }
}

/**
 * 获取话题列表
 * @param {number} pageIndex 页码
 * @param {number} pageSize 每页数量
 * @param {string} sortBy 排序方式：'hot'（热度）或 'new'（最新）
 */
async function getTopicList(pageIndex = 0, pageSize = 20, sortBy = 'hot') {
    const offset = pageIndex * pageSize
    
    let order
    if (sortBy === 'new') {
        order = [['lastActivityAt', 'DESC']]
    } else {
        order = [['blogCount', 'DESC'], ['lastActivityAt', 'DESC']]
    }
    
    const result = await Topic.findAndCountAll({
        where: {
            ...DEFAULT_WHERE,
            blogCount: {
                [Op.gt]: 0
            }
        },
        order,
        limit: pageSize,
        offset
    })
    
    return {
        count: result.count,
        topics: result.rows.map(row => row.dataValues)
    }
}

/**
 * 搜索话题
 * @param {string} keyword 关键词
 * @param {number} pageIndex 页码
 * @param {number} pageSize 每页数量
 */
async function searchTopics(keyword, pageIndex = 0, pageSize = 20) {
    if (!keyword || keyword.trim() === '') {
        return {
            count: 0,
            topics: []
        }
    }
    
    const offset = pageIndex * pageSize
    
    const result = await Topic.findAndCountAll({
        where: {
            ...DEFAULT_WHERE,
            name: {
                [Op.like]: `%${keyword}%`
            }
        },
        order: [['blogCount', 'DESC'], ['lastActivityAt', 'DESC']],
        limit: pageSize,
        offset
    })
    
    return {
        count: result.count,
        topics: result.rows.map(row => row.dataValues)
    }
}

/**
 * 获取话题详情
 * @param {number|string} topicIdOrName 话题 ID 或名称
 */
async function getTopicDetail(topicIdOrName) {
    let where = {
        ...DEFAULT_WHERE
    }
    
    if (typeof topicIdOrName === 'number') {
        where.id = topicIdOrName
    } else {
        where.name = topicIdOrName
    }
    
    const topic = await Topic.findOne({
        where
    })
    
    if (!topic) {
        return null
    }
    
    return topic.dataValues
}

/**
 * 获取话题下的微博列表
 * @param {number} topicId 话题 ID
 * @param {number} pageIndex 页码
 * @param {number} pageSize 每页数量
 * @param {number} userId 当前用户 ID（用于判断点赞、收藏状态）
 */
async function getTopicBlogs(topicId, pageIndex = 0, pageSize = 10, userId = null) {
    const offset = pageIndex * pageSize
    
    const blogTopicResult = await BlogTopic.findAndCountAll({
        where: {
            topicId,
            ...DEFAULT_WHERE
        },
        order: [['createdAt', 'DESC']],
        limit: pageSize,
        offset,
        include: [
            {
                model: Blog,
                include: [
                    {
                        model: User,
                        attributes: ['id', 'userName', 'nickName', 'picture']
                    }
                ]
            }
        ]
    })
    
    const blogs = []
    
    for (const blogTopic of blogTopicResult.rows) {
        if (!blogTopic.blog) continue
        
        const blog = blogTopic.blog
        const blogData = blog.dataValues
        
        const formattedBlog = formatBlog(blogData)
        formattedBlog.user = formatUser(blogData.user.dataValues)
        
        const collectCount = await Collect.count({
            where: {
                blogId: blog.id
            }
        })
        
        let isCollected = false
        if (userId) {
            const collect = await Collect.findOne({
                where: {
                    userId,
                    blogId: blog.id
                }
            })
            isCollected = !!collect
        }
        
        const likeCount = await Like.count({
            where: {
                blogId: blog.id
            }
        })
        
        let isLiked = false
        if (userId) {
            const like = await Like.findOne({
                where: {
                    userId,
                    blogId: blog.id
                }
            })
            isLiked = !!like
        }
        
        const commentCount = await Comment.count({
            where: {
                blogId: blog.id
            }
        })
        
        const repostCount = await Repost.count({
            where: {
                [Op.or]: [
                    { sourceBlogId: blog.id },
                    { rootBlogId: blog.id }
                ],
                ...DEFAULT_WHERE
            }
        })
        
        blogs.push({
            ...formattedBlog,
            collectCount,
            isCollected,
            likeCount,
            isLiked,
            commentCount,
            repostCount
        })
    }
    
    return {
        count: blogTopicResult.count,
        blogs
    }
}

/**
 * 获取热门话题
 * @param {number} limit 返回数量
 */
async function getHotTopics(limit = 10) {
    const result = await Topic.findAll({
        where: {
            ...DEFAULT_WHERE,
            blogCount: {
                [Op.gt]: 0
            }
        },
        order: [['blogCount', 'DESC'], ['lastActivityAt', 'DESC']],
        limit
    })
    
    return result.map(row => row.dataValues)
}

module.exports = {
    extractTopics,
    getOrCreateTopic,
    associateBlogWithTopics,
    disassociateBlogFromTopics,
    getTopicList,
    searchTopics,
    getTopicDetail,
    getTopicBlogs,
    getHotTopics
}
