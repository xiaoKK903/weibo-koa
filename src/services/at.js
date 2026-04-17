/**
 * @description @提醒 服务层
 * @author milk
 */

const { At, User, Blog, Comment } = require('../db/model/index')
const { formatUser, formatBlog, formatComment } = require('./_format')
const Sequelize = require('sequelize')
const Op = Sequelize.Op

/**
 * 从内容中提取 @用户名
 * @param {string} content 内容
 * @returns {Array} 用户名列表
 */
function extractAtUsers(content) {
    if (!content) {
        return []
    }
    
    // 匹配两种格式的正则表达式：
    // 1. @昵称 - userName 格式，例如：@张三 - zhangsan
    // 2. @userName 格式，例如：@zhangsan
    const regex = /@([^\s@]+?)\s-\s(\w+?)\b|@(\w+?)\b/g
    const userNames = []
    
    let match
    while ((match = regex.exec(content)) !== null) {
        // match[2] 是第一种格式的 userName
        // match[3] 是第二种格式的 userName
        const userName = match[2] || match[3]
        if (userName) {
            userNames.push(userName)
        }
    }
    
    // 去重
    return [...new Set(userNames)]
}

/**
 * 根据用户名列表获取用户ID列表
 * @param {Array} userNames 用户名列表
 * @returns {Array} 用户ID列表
 */
async function getUserIdsByUserNames(userNames) {
    if (!userNames || userNames.length === 0) {
        return []
    }
    
    const users = await User.findAll({
        where: {
            userName: {
                [Op.in]: userNames
            }
        },
        attributes: ['id', 'userName']
    })
    
    return users.map(u => u.dataValues)
}

/**
 * 创建 @提醒
 * @param {number} fromUserId 发送者ID
 * @param {Array} toUserIds 接收者ID列表
 * @param {number} blogId 微博ID
 * @param {number} commentId 评论ID（可选）
 * @param {string} type 类型：blog 或 comment
 */
async function createAtReminder(fromUserId, toUserIds, blogId, commentId = null, type = 'blog') {
    if (!toUserIds || toUserIds.length === 0) {
        return
    }
    
    // 过滤掉自己 @自己 的情况
    const validToUserIds = toUserIds.filter(id => id !== fromUserId)
    
    if (validToUserIds.length === 0) {
        return
    }
    
    // 批量创建 @提醒
    const promises = validToUserIds.map(toUserId => {
        return At.findOrCreate({
            where: {
                fromUserId,
                toUserId,
                blogId,
                commentId: commentId || null
            },
            defaults: {
                fromUserId,
                toUserId,
                blogId,
                commentId: commentId || null,
                isRead: false,
                type
            }
        })
    })
    
    try {
        await Promise.all(promises)
    } catch (ex) {
        console.error('创建@提醒失败:', ex.message, ex.stack)
    }
}

/**
 * 处理内容中的 @用户
 * @param {string} content 内容
 * @param {number} fromUserId 发送者ID
 * @param {number} blogId 微博ID
 * @param {number} commentId 评论ID（可选）
 * @param {string} type 类型：blog 或 comment
 */
async function processAtUsers(content, fromUserId, blogId, commentId = null, type = 'blog') {
    // 1. 提取 @用户名
    const userNames = extractAtUsers(content)
    
    if (userNames.length === 0) {
        return
    }
    
    // 2. 获取用户ID
    const users = await getUserIdsByUserNames(userNames)
    const toUserIds = users.map(u => u.id)
    
    if (toUserIds.length === 0) {
        return
    }
    
    // 3. 创建 @提醒
    await createAtReminder(fromUserId, toUserIds, blogId, commentId, type)
}

/**
 * 获取用户的 @提醒列表
 * @param {number} toUserId 接收者ID
 * @param {number} pageIndex 页码
 * @param {number} pageSize 每页数量
 * @param {boolean} onlyUnread 是否只获取未读
 */
async function getAtListByUserId(toUserId, pageIndex = 0, pageSize = 10, onlyUnread = false) {
    const whereOpts = {
        toUserId
    }
    
    if (onlyUnread) {
        whereOpts.isRead = false
    }
    
    const result = await At.findAndCountAll({
        where: whereOpts,
        limit: pageSize,
        offset: pageSize * pageIndex,
        order: [['createdAt', 'desc']],
        include: [
            {
                model: User,
                as: 'fromUser',
                attributes: ['id', 'userName', 'nickName', 'picture']
            },
            {
                model: Blog,
                as: 'blog',
                attributes: ['id', 'content', 'image', 'createdAt']
            },
            {
                model: Comment,
                as: 'comment',
                attributes: ['id', 'content', 'createdAt']
            }
        ]
    })
    
    const atList = result.rows.map(row => row.dataValues)
    
    // 格式化数据
    const formattedList = atList.map(item => {
        const fromUser = item.fromUser ? formatUser(item.fromUser.dataValues) : null
        const blog = item.blog ? formatBlog(item.blog.dataValues) : null
        const comment = item.comment ? formatComment(item.comment.dataValues) : null
        
        return {
            id: item.id,
            fromUser,
            blog,
            comment,
            isRead: item.isRead,
            type: item.type,
            createdAt: item.createdAt,
            createdAtFormat: item.createdAt ? formatDate(item.createdAt) : ''
        }
    })
    
    return {
        count: result.count,
        atList: formattedList
    }
}

/**
 * 格式化日期
 * @param {Date} date 日期
 */
function formatDate(date) {
    if (!date) return ''
    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const hour = String(d.getHours()).padStart(2, '0')
    const minute = String(d.getMinutes()).padStart(2, '0')
    return `${month}.${day} ${hour}:${minute}`
}

/**
 * 获取用户未读 @提醒 的数量
 * @param {number} toUserId 接收者ID
 */
async function getUnreadAtCount(toUserId) {
    const count = await At.count({
        where: {
            toUserId,
            isRead: false
        }
    })
    return count
}

/**
 * 标记 @提醒 为已读
 * @param {number} atId @提醒 ID
 * @param {number} toUserId 接收者ID（用于验证权限）
 */
async function markAsRead(atId, toUserId) {
    const result = await At.update(
        { isRead: true },
        {
            where: {
                id: atId,
                toUserId
            }
        }
    )
    return result[0] > 0
}

/**
 * 标记用户的所有 @提醒 为已读
 * @param {number} toUserId 接收者ID
 */
async function markAllAsRead(toUserId) {
    const result = await At.update(
        { isRead: true },
        {
            where: {
                toUserId,
                isRead: false
            }
        }
    )
    return result[0]
}

module.exports = {
    extractAtUsers,
    getUserIdsByUserNames,
    createAtReminder,
    processAtUsers,
    getAtListByUserId,
    getUnreadAtCount,
    markAsRead,
    markAllAsRead
}