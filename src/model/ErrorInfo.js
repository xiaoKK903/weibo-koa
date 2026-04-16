/**
 * @description 失败信息集合，包括 errno 和 message
 * @author milk
 */

module.exports = {
    // 用户名已存在
    registerUserNameExistInfo: {
        errno: 10001,
        message: '用户名已存在'
    },
    // 注册失败
    registerFailInfo: {
        errno: 10002,
        message: '注册失败，请重试'
    },
    // 用户名不存在
    registerUserNameNotExistInfo: {
        errno: 10003,
        message: '用户名未存在'
    },
    // 登录失败
    loginFailInfo: {
        errno: 10004,
        message: '登录失败，用户名或密码错误'
    },
    // 未登录
    loginCheckFailInfo: {
        errno: 10005,
        message: '您尚未登录'
    },
    // 原密码错误
    oldPasswordErrorInfo: {
        errno: 10006,
        message: '原密码错误，请重新输入'
    },
    // 修改密码失败
    changePasswordFailInfo: {
        errno: 10007,
        message: '修改密码失败，请重试'
    },
    // 密码强度不足
    passwordWeakInfo: {
        errno: 10011,
        message: '密码强度不足，必须包含数字、字母、特殊符号三种组合'
    },
    // 上传文件过大
    uploadFileSizeFailInfo: {
        errno: 10008,
        message: '上传文件尺寸过大'
    },
    // 修改基本信息失败
    changeInfoFailInfo: {
        errno: 10009,
        message: '修改基本信息失败'
    },
    // json schema 校验失败
    jsonSchemaFileInfo: {
        errno: 10010,
        message: '数据格式校验错误'
    },
    // 删除用户失败
    deleteUserFailInfo: {
        errno: 10012,
        message: '删除用户失败'
    },

    // 创建微博失败
    createBlogFailInfo: {
        errno: 11001,
        message: '创建微博失败，请重试'
    },
    // 删除微博失败
    deleteBlogFailInfo: {
        errno: 11002,
        message: '删除微博失败，请重试'
    },
    // 微博不存在
    blogNotExistInfo: {
        errno: 11003,
        message: '微博不存在'
    },
    // 创建评论失败
    createCommentFailInfo: {
        errno: 11004,
        message: '创建评论失败，请重试'
    }
}
