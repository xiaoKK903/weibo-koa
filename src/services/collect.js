/**
 * @description 收藏服务
 * @author milk
 */

const { Collect, Blog, User } = require('../db/model/index')

/**
 * 创建收藏
 * @param {number} userId 用户ID
 * @param {number} blogId 微博ID
 */
async function createCollect(userId, blogId) {
    const result = await Collect.create({
        userId,
        blogId
    })
    return result
}

/**
 * 取消收藏
 * @param {number} userId 用户ID
 * @param {number} blogId 微博ID
 */
async function deleteCollect(userId, blogId) {
    const result = await Collect.destroy({
        where: {
            userId,
            blogId
        }
    })
    return result > 0
}

/**
 * 获取用户收藏列表
 * @param {number} userId 用户ID
 * @param {number} pageIndex 页码
 * @param {number} pageSize 每页数量
 */
async function getCollectsByUserId(userId, pageIndex = 0, pageSize = 10) {
    const result = await Collect.findAndCountAll({
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
    
    const collects = result.rows.map(row => row.dataValues)
    
    const blogList = collects.map(item => {
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
 * 获取用户是否收藏了指定微博
 * @param {number} userId 用户ID
 * @param {number} blogId 微博ID
 */
async function getCollectByUserIdAndBlogId(userId, blogId) {
    const result = await Collect.findOne({
        where: {
            userId,
            blogId
        }
    })
    return result
}

/**
 * 获取微博的收藏数
 * @param {number} blogId 微博ID
 */
async function getCollectCountByBlogId(blogId) {
    const result = await Collect.count({
        where: {
            blogId
        }
    })
    return result
}

module.exports = {
    createCollect,
    deleteCollect,
    getCollectsByUserId,
    getCollectByUserIdAndBlogId,
    getCollectCountByBlogId
}