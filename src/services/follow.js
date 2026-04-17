/**
 * @description 关注服务
 * @author milk
 */

const { Follow } = require('../db/model/index')

/**
 * 关注用户
 * @param {number} followerId 关注者ID
 * @param {number} followingId 被关注者ID
 */
async function followUser(followerId, followingId) {
    try {
        const result = await Follow.create({
            followerId,
            followingId
        })
        return result
    } catch (ex) {
        console.error(ex.message, ex.stack)
        return null
    }
}

/**
 * 取消关注用户
 * @param {number} followerId 关注者ID
 * @param {number} followingId 被关注者ID
 */
async function unfollowUser(followerId, followingId) {
    try {
        const result = await Follow.destroy({
            where: {
                followerId,
                followingId
            }
        })
        return result > 0
    } catch (ex) {
        console.error(ex.message, ex.stack)
        return false
    }
}

/**
 * 检查是否已关注
 * @param {number} followerId 关注者ID
 * @param {number} followingId 被关注者ID
 */
async function checkFollowStatus(followerId, followingId) {
    try {
        const result = await Follow.findOne({
            where: {
                followerId,
                followingId
            }
        })
        return result !== null
    } catch (ex) {
        console.error(ex.message, ex.stack)
        return false
    }
}

/**
 * 获取关注数
 * @param {number} userId 用户ID
 */
async function getFollowingCount(userId) {
    try {
        const result = await Follow.count({
            where: {
                followerId: userId
            }
        })
        return result
    } catch (ex) {
        console.error(ex.message, ex.stack)
        return 0
    }
}

/**
 * 获取粉丝数
 * @param {number} userId 用户ID
 */
async function getFollowerCount(userId) {
    try {
        const result = await Follow.count({
            where: {
                followingId: userId
            }
        })
        return result
    } catch (ex) {
        console.error(ex.message, ex.stack)
        return 0
    }
}

module.exports = {
    followUser,
    unfollowUser,
    checkFollowStatus,
    getFollowingCount,
    getFollowerCount
}
