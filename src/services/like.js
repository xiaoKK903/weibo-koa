/**
 * @description 点赞服务
 * @author milk
 */

const { Like, Blog, User } = require('../db/model/index')

/**
 * 创建点赞
 * @param {number} userId 用户ID
 * @param {number} blogId 微博ID
 */
async function createLike(userId, blogId) {
    try {
        const result = await Like.create({
            userId,
            blogId
        })
        return result
    } catch (ex) {
        console.error(ex.message, ex.stack)
        return null
    }
}

/**
 * 取消点赞
 * @param {number} userId 用户ID
 * @param {number} blogId 微博ID
 */
async function deleteLike(userId, blogId) {
    try {
        const result = await Like.destroy({
            where: {
                userId,
                blogId
            }
        })
        return result > 0
    } catch (ex) {
        console.error(ex.message, ex.stack)
        return false
    }
}

/**
 * 获取用户点赞列表
 * @param {number} userId 用户ID
 * @param {number} pageIndex 页码
 * @param {number} pageSize 每页数量
 */
async function getLikesByUserId(userId, pageIndex = 0, pageSize = 10) {
    const result = await Like.findAndCountAll({
        where: {
            userId
        },
        include: [
            {
                model: Blog,
                include: [
                    {
                        model: User,
                        attributes: ['userName', 'nickName', 'picture', 'city']
                    }
                ]
            }
        ],
        order: [['createdAt', 'desc']],
        limit: pageSize,
        offset: pageSize * pageIndex
    })
    
    const likes = result.rows.map(row => row.dataValues)
    
    const blogList = likes.map(item => {
        const blog = item.Blog.dataValues
        const user = blog.User.dataValues
        return {
            id: blog.id,
            content: blog.content,
            image: blog.image,
            createdAt: blog.createdAt,
            user
        }
    })
    
    return {
        count: result.count,
        blogList
    }
}

/**
 * 获取用户是否点赞了指定微博
 * @param {number} userId 用户ID
 * @param {number} blogId 微博ID
 */
async function getLikeByUserIdAndBlogId(userId, blogId) {
    const result = await Like.findOne({
        where: {
            userId,
            blogId
        }
    })
    return result
}

/**
 * 获取微博的点赞数
 * @param {number} blogId 微博ID
 */
async function getLikeCountByBlogId(blogId) {
    const result = await Like.count({
        where: {
            blogId
        }
    })
    return result
}

module.exports = {
    createLike,
    deleteLike,
    getLikesByUserId,
    getLikeByUserIdAndBlogId,
    getLikeCountByBlogId
}