/**
 * @description user service
 * @author milk
 */

const { User } = require('../db/model/index')
const { formatUser } = require('./_format')


/**
 * 获取用户信息
 * @param {string} userName 用户名
 * @param {string} password 密码
 */
async function getUserInfo(userName, password) {
    const whereOpt = {
        userName
    }
    if (password) {
        Object.assign(whereOpt, { password })
    }

    const result = await User.findOne({
        attributes: ['id', 'userName', 'nickName', 'picture', 'city', 'signature', 'bio', 'coverImage'],
        where: whereOpt
    })
    if (result == null) {
        return result
    }

    const formatRes = formatUser(result.dataValues)

    return formatRes
}

/**
 * 检查昵称是否已被其他用户使用
 * @param {string} nickName 昵称
 * @param {number} excludeUserId 排除的用户ID（自己）
 * @returns {Promise<boolean>} 是否存在
 */
async function checkNickNameExist(nickName, excludeUserId = null) {
    if (!nickName) {
        return false
    }

    const whereOpt = {
        nickName
    }

    if (excludeUserId) {
        whereOpt.id = {
            [require('sequelize').Op.ne]: excludeUserId
        }
    }

    const result = await User.findOne({
        attributes: ['id'],
        where: whereOpt
    })

    return result !== null
}

/**
 * 创建用户
 * @param {string} userName 用户名
 * @param {string} password 密码
 * @param {number} gender 性别
 * @param {string} nickName 昵称
 */
async function createUser({ userName, password, gender = 3, nickName }) {
    const result = await User.create({
        userName,
        password,
        nickName: nickName ? nickName : userName,
        gender
    })
    const data = result.dataValues

    return data
}

/**
 * 删除用户
 * @param {string} userName 用户名
 */
async function deleteUser(userName) {
    const result = await User.destroy({
        where: {
            userName
        }
    })
    return result > 0
}

/**
 * 更新用户信息
 * @param {Object} param0 要修改的内容 
 * @param {Object} param1 查询条件
 */
async function updateUser(
    { 
        newPassword, 
        newNickName, 
        newPicture, 
        newCity, 
        newSignature, 
        newBio, 
        newCoverImage 
    },
    { userName, password }
) {
    const updateData = {}
    if (newPassword) {
        updateData.password = newPassword
    }
    if (newNickName) {
        updateData.nickName = newNickName
    }
    if (newPicture) {
        updateData.picture = newPicture
    }
    if (newCity !== undefined) {
        updateData.city = newCity
    }
    if (newSignature !== undefined) {
        updateData.signature = newSignature
    }
    if (newBio !== undefined) {
        updateData.bio = newBio
    }
    if (newCoverImage !== undefined) {
        updateData.coverImage = newCoverImage
    }

    const whereData = {
        userName
    }
    if (password) {
        whereData.password = password
    }

    const result = await User.update(updateData, {
        where: whereData
    })
    return result[0] > 0
}

module.exports = {
    getUserInfo,
    checkNickNameExist,
    createUser,
    deleteUser,
    updateUser
}
