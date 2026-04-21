/**
 * @description 屏蔽服务
 * @author milk
 */

const { Block, User } = require('../db/model/index')

/**
 * 屏蔽用户
 * @param {number} blockerId 屏蔽者ID
 * @param {number} blockedId 被屏蔽者ID
 */
async function blockUser(blockerId, blockedId) {
    if (blockerId === blockedId) {
        return { success: false, message: '不能屏蔽自己' }
    }
    
    try {
        const existingBlock = await Block.findOne({
            where: {
                blockerId,
                blockedId
            }
        })
        
        if (existingBlock) {
            return { success: false, message: '您已经屏蔽过该用户' }
        }
        
        await Block.create({
            blockerId,
            blockedId
        })
        
        return { success: true, message: '屏蔽成功' }
    } catch (ex) {
        console.error(ex.message, ex.stack)
        return { success: false, message: '屏蔽失败' }
    }
}

/**
 * 取消屏蔽用户
 * @param {number} blockerId 屏蔽者ID
 * @param {number} blockedId 被屏蔽者ID
 */
async function unblockUser(blockerId, blockedId) {
    try {
        const result = await Block.destroy({
            where: {
                blockerId,
                blockedId
            }
        })
        
        return { success: result > 0, message: result > 0 ? '取消屏蔽成功' : '未找到屏蔽记录' }
    } catch (ex) {
        console.error(ex.message, ex.stack)
        return { success: false, message: '取消屏蔽失败' }
    }
}

/**
 * 检查是否已屏蔽
 * @param {number} blockerId 屏蔽者ID
 * @param {number} blockedId 被屏蔽者ID
 */
async function checkBlockStatus(blockerId, blockedId) {
    if (!blockerId || !blockedId) {
        return false
    }
    
    try {
        const result = await Block.findOne({
            where: {
                blockerId,
                blockedId
            }
        })
        return result !== null
    } catch (ex) {
        console.error(ex.message, ex.stack)
        return false
    }
}

/**
 * 检查是否被对方屏蔽
 * @param {number} userId 当前用户ID
 * @param {number} targetUserId 目标用户ID
 */
async function checkIsBlockedBy(userId, targetUserId) {
    if (!userId || !targetUserId) {
        return false
    }
    
    try {
        const result = await Block.findOne({
            where: {
                blockerId: targetUserId,
                blockedId: userId
            }
        })
        return result !== null
    } catch (ex) {
        console.error(ex.message, ex.stack)
        return false
    }
}

/**
 * 获取已屏蔽用户列表
 * @param {number} blockerId 屏蔽者ID
 */
async function getBlockedUsers(blockerId) {
    try {
        const result = await Block.findAll({
            where: {
                blockerId
            },
            include: [
                {
                    model: User,
                    as: 'blocked',
                    attributes: ['id', 'userName', 'nickName', 'picture', 'intro']
                }
            ],
            order: [['createdAt', 'desc']]
        })
        
        return result.map(item => {
            if (item.blocked) {
                return item.blocked.dataValues
            }
            return null
        }).filter(item => item !== null)
    } catch (ex) {
        console.error(ex.message, ex.stack)
        return []
    }
}

/**
 * 获取已屏蔽用户数
 * @param {number} blockerId 屏蔽者ID
 */
async function getBlockedCount(blockerId) {
    try {
        const result = await Block.count({
            where: {
                blockerId
            }
        })
        return result
    } catch (ex) {
        console.error(ex.message, ex.stack)
        return 0
    }
}

/**
 * 获取已屏蔽用户的ID列表
 * @param {number} blockerId 屏蔽者ID
 */
async function getBlockedUserIds(blockerId) {
    if (!blockerId) {
        return []
    }
    
    try {
        const result = await Block.findAll({
            where: {
                blockerId
            },
            attributes: ['blockedId']
        })
        
        return result.map(item => item.blockedId)
    } catch (ex) {
        console.error(ex.message, ex.stack)
        return []
    }
}

/**
 * 获取屏蔽我的用户ID列表
 * @param {number} userId 当前用户ID
 */
async function getBlockersIds(userId) {
    if (!userId) {
        return []
    }
    
    try {
        const result = await Block.findAll({
            where: {
                blockedId: userId
            },
            attributes: ['blockerId']
        })
        
        return result.map(item => item.blockerId)
    } catch (ex) {
        console.error(ex.message, ex.stack)
        return []
    }
}

module.exports = {
    blockUser,
    unblockUser,
    checkBlockStatus,
    checkIsBlockedBy,
    getBlockedUsers,
    getBlockedCount,
    getBlockedUserIds,
    getBlockersIds
}
