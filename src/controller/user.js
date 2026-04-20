/**
 * @description user controller
 * @author milk
 */

const {
  getUserInfo,
  createUser,
  deleteUser,
  updateUser,
  checkNickNameExist,
} = require("../services/user");
const { SuccessModel, ErrorModel } = require("../model/ResModel");
const {
  registerUserNameNotExistInfo,
  registerUserNameExistInfo,
  registerFailInfo,
  loginFailInfo,
  loginCheckFailInfo,
  deleteUserFailInfo,
  changeInfoFailInfo,
  changePasswordFailInfo,
  oldPasswordErrorInfo,
  passwordWeakInfo,
  nickNameExistInfo,
} = require("../model/ErrorInfo");
const doCrypto = require("../utils/cryp");
const { addPoint } = require("../services/point");
const { ACTION_TYPES } = require("../conf/pointRules");

/**
 * 用户名是否存在
 * @param {string} userName 用户名
 */
async function isExist(userName) {
  const userInfo = await getUserInfo(userName);
  if (userInfo) {
    return new SuccessModel(userInfo);
  } else {
    return new ErrorModel(registerUserNameNotExistInfo);
  }
}

/**
 * 检查昵称是否已存在（排除自己）
 * @param {Object} ctx koa ctx
 * @param {string} nickName 昵称
 */
async function checkNickName(ctx, { nickName }) {
  try {
    console.log('=== checkNickName ===');
    console.log('ctx.session:', ctx.session);
    console.log('ctx.session.userInfo:', ctx.session ? ctx.session.userInfo : 'session not exist');
    
    if (!ctx.session || !ctx.session.userInfo) {
      console.error('CRITICAL_ERROR_TRACE: Session or userInfo not found');
      return new ErrorModel(loginCheckFailInfo);
    }
    
    const { id: userId } = ctx.session.userInfo;
    const exists = await checkNickNameExist(nickName, userId);
    if (exists) {
      return new ErrorModel(nickNameExistInfo);
    }
    return new SuccessModel({ exists: false });
  } catch (error) {
    console.error('CRITICAL_ERROR_TRACE: checkNickName error');
    console.error('Error:', error);
    console.error('Error stack:', error.stack || error);
    return new ErrorModel(changeInfoFailInfo);
  }
}

/**
 * 获取当前用户完整信息
 * @param {Object} ctx koa ctx
 */
async function getCurrentUserInfo(ctx) {
  try {
    console.log('=== getCurrentUserInfo ===');
    console.log('ctx.session:', ctx.session);
    console.log('ctx.session.userInfo:', ctx.session ? ctx.session.userInfo : 'session not exist');
    
    if (!ctx.session || !ctx.session.userInfo) {
      console.error('CRITICAL_ERROR_TRACE: Session or userInfo not found');
      return new ErrorModel(loginCheckFailInfo);
    }
    
    const { userName } = ctx.session.userInfo;
    const userInfo = await getUserInfo(userName);
    if (userInfo) {
      return new SuccessModel(userInfo);
    }
    return new ErrorModel(changeInfoFailInfo);
  } catch (error) {
    console.error('CRITICAL_ERROR_TRACE: getCurrentUserInfo error');
    console.error('Error:', error);
    console.error('Error stack:', error.stack || error);
    return new ErrorModel(changeInfoFailInfo);
  }
}

/**
 * 注册
 * @param {string} userName 用户名
 * @param {string} password 密码
 * @param {number} gender 性别（1 男，2 女，3 保密）
 */
async function register({ userName, password, gender }) {
  try {
    console.log('=== register ===');
    
    const userInfo = await getUserInfo(userName);
    if (userInfo) {
      return new ErrorModel(registerUserNameExistInfo);
    }

    await createUser({
      userName,
      password: doCrypto(password),
      gender,
    });
    return new SuccessModel();
  } catch (ex) {
    console.error('CRITICAL_ERROR_TRACE: register error');
    console.error('Error:', ex);
    console.error('Error stack:', ex.stack || ex);
    return new ErrorModel(registerFailInfo);
  }
}

/**
 * 登录
 * @param {Object} ctx koa2 ctx
 * @param {string} userName 用户名
 * @param {string} password 密码
 */
async function login(ctx, userName, password) {
  try {
    console.log('=== login ===');
    
    const userInfo = await getUserInfo(userName, doCrypto(password));
    if (!userInfo) {
      return new ErrorModel(loginFailInfo);
    }

    if (ctx.session.userInfo == null) {
      ctx.session.userInfo = userInfo;
    }

    addPoint(userInfo.id, ACTION_TYPES.LOGIN).catch(err => {
      console.error('[积分服务] 登录添加积分失败:', err.message);
    });

    return new SuccessModel();
  } catch (error) {
    console.error('CRITICAL_ERROR_TRACE: login error');
    console.error('Error:', error);
    console.error('Error stack:', error.stack || error);
    return new ErrorModel(loginFailInfo);
  }
}

/**
 * 删除当前用户
 * @param {string} userName 用户名
 */
async function deleteCurUser(userName) {
  const result = await deleteUser(userName);
  if (result) {
    return new SuccessModel();
  }
  return new ErrorModel(deleteUserFailInfo);
}

/**
 * 修改个人信息
 * @param {Object} ctx ctx
 */
async function changeInfo(ctx, { nickName, city, picture, signature, bio, coverImage }) {
  try {
    console.log('=== changeInfo START ===');
    console.log('ctx.request.body:', ctx.request.body);
    console.log('ctx.session:', ctx.session);
    console.log('ctx.session.userInfo:', ctx.session ? ctx.session.userInfo : 'session not exist');
    
    // 检查 session
    if (!ctx.session) {
      console.error('CRITICAL_ERROR_TRACE: Session not found');
      return new ErrorModel(loginCheckFailInfo);
    }
    
    if (!ctx.session.userInfo) {
      console.error('CRITICAL_ERROR_TRACE: userInfo not found in session');
      return new ErrorModel(loginCheckFailInfo);
    }
    
    const { userName, id: userId } = ctx.session.userInfo;
    console.log('userName:', userName);
    console.log('userId:', userId);
    
    // 处理 nickName
    if (!nickName) {
      nickName = userName;
    }
    console.log('nickName:', nickName);
    
    // 检查昵称是否重复
    console.log('Checking nickName existence...');
    const nickExists = await checkNickNameExist(nickName, userId);
    console.log('nickExists:', nickExists);
    
    if (nickExists) {
      console.log('Nickname already exists');
      return new ErrorModel(nickNameExistInfo);
    }

    // 准备更新数据
    console.log('Preparing update data...');
    console.log('newNickName:', nickName);
    console.log('newCity:', city);
    console.log('newPicture:', picture);
    console.log('newSignature:', signature);
    console.log('newBio:', bio);
    console.log('newCoverImage:', coverImage);

    // 执行更新
    console.log('Calling updateUser...');
    const result = await updateUser(
      {
        newNickName: nickName,
        newCity: city,
        newPicture: picture,
        newSignature: signature,
        newBio: bio,
        newCoverImage: coverImage,
      },
      { userName },
    );
    
    console.log('updateUser result:', result);
    
    // 无论 result 是 true 还是 false，都返回成功
    // 因为 result 为 false 可能是因为没有任何字段需要更新
    console.log('Updating session...');
    const updateData = {};
    // 只更新有值的属性，避免覆盖为undefined
    if (nickName !== undefined) {
      updateData.nickName = nickName;
    }
    if (city !== undefined) {
      updateData.city = city;
    }
    if (picture !== undefined) {
      updateData.picture = picture;
    }
    if (signature !== undefined) {
      updateData.signature = signature;
    }
    if (bio !== undefined) {
      updateData.bio = bio;
    }
    if (coverImage !== undefined) {
      updateData.coverImage = coverImage;
    }
    
    console.log('updateData:', updateData);
    
    // 确保session.userInfo存在且是对象
    if (!ctx.session.userInfo) {
      ctx.session.userInfo = {};
    }
    Object.assign(ctx.session.userInfo, updateData);
    console.log('Session updated successfully');
    console.log('=== changeInfo SUCCESS ===');
    return new SuccessModel();
  } catch (error) {
    console.error('CRITICAL_ERROR_TRACE: changeInfo error');
    console.error('Error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack || error);
    return new ErrorModel(changeInfoFailInfo);
  }
}

function validatePasswordStrength(password) {
  const hasNumber = /\d/.test(password);
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/~`]/.test(password);
  return hasNumber && hasLetter && hasSpecial;
}

/**
 * 修改密码
 * @param {string} userName 用户名
 * @param {string} password 当前密码
 * @param {string} newPassword 新密码
 */
async function changePassword(userName, password, newPassword) {
  try {
    console.log('=== changePassword ===');
    
    const userInfo = await getUserInfo(userName, doCrypto(password));
    if (!userInfo) {
      return new ErrorModel(oldPasswordErrorInfo);
    }

    if (!validatePasswordStrength(newPassword)) {
      return new ErrorModel(passwordWeakInfo);
    }

    const result = await updateUser(
      {
        newPassword: doCrypto(newPassword),
      },
      {
        userName,
      },
    );
    if (result) {
      return new SuccessModel();
    }
    return new ErrorModel(changePasswordFailInfo);
  } catch (error) {
    console.error('CRITICAL_ERROR_TRACE: changePassword error');
    console.error('Error:', error);
    console.error('Error stack:', error.stack || error);
    return new ErrorModel(changePasswordFailInfo);
  }
}

/**
 * 退出登录
 * @param {Object} ctx ctx
 */
async function logout(ctx) {
  try {
    console.log('=== logout ===');
    console.log('ctx.session:', ctx.session);
    
    delete ctx.session.userInfo;
    return new SuccessModel();
  } catch (error) {
    console.error('CRITICAL_ERROR_TRACE: logout error');
    console.error('Error:', error);
    console.error('Error stack:', error.stack || error);
    return new SuccessModel(); // 即使出错也要返回成功，确保用户可以退出
  }
}

module.exports = {
  isExist,
  checkNickName,
  getCurrentUserInfo,
  register,
  login,
  deleteCurUser,
  changeInfo,
  changePassword,
  logout,
};
