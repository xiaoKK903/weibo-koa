/**
 * @description 关注控制器
 * @author milk
 */

const { followUser, unfollowUser, checkFollowStatus, getFollowingCount, getFollowerCount, getFollowingList, getFollowerList } = require('../services/follow')
const { SuccessModel, ErrorModel } = require('../model/ResModel')
const { followFailInfo, unfollowFailInfo } = require('../model/ErrorInfo')

/**
 * 关注用户
 * @param {Object} ctx koa2 ctx
 * @param {number} followingId 被关注者ID
 */
async function follow(ctx, followingId) {
    const { id: followerId } = ctx.session.userInfo
    
    try {
        const result = await followUser(followerId, followingId)
        if (result) {
            return new SuccessModel()
        } else {
            return new ErrorModel(followFailInfo)
        }
    } catch (ex) {
        console.error(ex.message, ex.stack)
        return new ErrorModel(followFailInfo)
    }
}

/**
 * 取消关注用户
 * @param {Object} ctx koa2 ctx
 * @param {number} followingId 被关注者ID
 */
async function unfollow(ctx, followingId) {
    const { id: followerId } = ctx.session.userInfo
    
    try {
        const result = await unfollowUser(followerId, followingId)
        if (result) {
            return new SuccessModel()
        } else {
            return new ErrorModel(unfollowFailInfo)
        }
    } catch (ex) {
        console.error(ex.message, ex.stack)
        return new ErrorModel(unfollowFailInfo)
    }
}

/**
 * 检查关注状态
 * @param {Object} ctx koa2 ctx
 * @param {number} followingId 被关注者ID
 */
async function checkFollow(ctx, followingId) {
    const { id: followerId } = ctx.session.userInfo
    
    try {
        const isFollowing = await checkFollowStatus(followerId, followingId)
        return new SuccessModel({ isFollowing })
    } catch (ex) {
        console.error(ex.message, ex.stack)
        return new SuccessModel({ isFollowing: false })
    }
}

/**
 * 获取用户的关注数和粉丝数
 * @param {number} userId 用户ID
 */
async function getUserFollowStats(userId) {
    try {
        const followingCount = await getFollowingCount(userId)
        const followerCount = await getFollowerCount(userId)
        return new SuccessModel({
            followingCount,
            followerCount
        })
    } catch (ex) {
        console.error(ex.message, ex.stack)
        return new SuccessModel({
            followingCount: 0,
            followerCount: 0
        })
    }
}

/**
 * 获取用户的关注列表
 * @param {number} userId 用户ID
 */
async function getUserFollowingList(userId) {
    try {
        const followingList = await getFollowingList(userId)
        const followingCount = await getFollowingCount(userId)
        return new SuccessModel({
            list: followingList,
            count: followingCount
        })
    } catch (ex) {
        console.error(ex.message, ex.stack)
        return new SuccessModel({
            list: [],
            count: 0
        })
    }
}

/**
 * 获取用户的粉丝列表
 * @param {number} userId 用户ID
 */
async function getUserFollowerList(userId) {
    try {
        const followerList = await getFollowerList(userId)
        const followerCount = await getFollowerCount(userId)
        return new SuccessModel({
            list: followerList,
            count: followerCount
        })
    } catch (ex) {
        console.error(ex.message, ex.stack)
        return new SuccessModel({
            list: [],
            count: 0
        })
    }
}

module.exports = {
    follow,
    unfollow,
    checkFollow,
    getUserFollowStats,
    getUserFollowingList,
    getUserFollowerList
}
