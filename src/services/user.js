/**
 * @description user service
 * @author milk
 */

const { User } = require('../db/model/index')
const { formatUser } = require('./_format')
const Sequelize = require('sequelize')
const Op = Sequelize.Op


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
    console.log('=== checkNickNameExist START ===');
    console.log('nickName:', nickName);
    console.log('excludeUserId:', excludeUserId);
    console.log('typeof excludeUserId:', typeof excludeUserId);
    
    if (!nickName) {
        console.log('nickName is empty, returning false');
        return false
    }

    const whereOpt = {
        nickName
    }

    // 如果 excludeUserId 不是 undefined 或 null，则添加 id 的过滤条件
    // 使用 != null 来检查是否为 undefined 或 null
    if (excludeUserId != null) {
        whereOpt.id = {
            [Op.ne]: excludeUserId
        }
    }
    
    console.log('whereOpt:', whereOpt);

    console.log('Executing User.findOne...');
    const result = await User.findOne({
        attributes: ['id'],
        where: whereOpt
    })
    
    console.log('User.findOne result:', result);
    console.log('Returning:', result !== null);
    console.log('=== checkNickNameExist END ===');

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
    console.log('=== updateUser START ===');
    console.log('userName:', userName);
    console.log('newPassword:', newPassword);
    console.log('newNickName:', newNickName);
    console.log('newPicture:', newPicture);
    console.log('newCity:', newCity);
    console.log('newSignature:', newSignature);
    console.log('newBio:', newBio);
    console.log('newCoverImage:', newCoverImage);
    
    const updateData = {}
    if (newPassword !== undefined) {
        updateData.password = newPassword
    }
    if (newNickName !== undefined) {
        updateData.nickName = newNickName
    }
    if (newPicture !== undefined) {
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

    console.log('updateData:', updateData);
    
    const whereData = {
        userName
    }
    if (password) {
        whereData.password = password
    }
    
    console.log('whereData:', whereData);

    console.log('Executing User.update...');
    const result = await User.update(updateData, {
        where: whereData
    })
    
    console.log('User.update result:', result);
    console.log('result[0]:', result[0]);
    console.log('Returning:', result[0] > 0);
    console.log('=== updateUser END ===');
    
    return result[0] > 0
}

module.exports = {
    getUserInfo,
    checkNickNameExist,
    createUser,
    deleteUser,
    updateUser
}
