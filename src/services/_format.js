/**
 * @description 数据格式化
 * @author milk
 */

const { DEFAULT_PICTURE, REG_FOR_AT_WHO } = require('../conf/constant')
const { timeFormat } = require('../utils/dt')

/**
 * 用户默认头像
 * @param {Object} obj 用户对象
 */
function _formatUserPicture(obj) {
    if (obj.picture == null) {
        obj.picture = DEFAULT_PICTURE
    }
    return obj
}

/**
 * 格式化用户信息
 * @param {Array|Object} list 用户列表或者单个用户对象
 */
function formatUser(list) {
    if (list == null) {
        return list
    }

    if (list instanceof Array) {
        // 数组 用户列表
        return list.map(_formatUserPicture)
    }

    // 单个对象
    return _formatUserPicture(list)
}

/**
 * 格式化数据的时间
 * @param {Object} obj 数据
 */
function _formatDBTime(obj) {
    obj.createdAtFormat = timeFormat(obj.createdAt)
    obj.updatedAtFormat = timeFormat(obj.updatedAt)
    return obj
}

/**
 * 提取纯文本并截取摘要
 * @param {string} html HTML内容
 * @param {number} length 摘要长度
 */
function _getPlainTextSummary(html, length = 80) {
    // 移除HTML标签
    const plainText = html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ')
    // 截取前length个字符
    return plainText.length > length ? plainText.substring(0, length) + '...' : plainText
}

/**
 * 格式化微博内容
 * @param {Object} obj 微博数据对象
 */
function _formatContent(obj) {
    obj.contentFormat = obj.content

    // 格式化 @
    // 支持两种格式：
    // 1. '哈喽 @张三 - zhangsan 你好' -> '哈喽 <a href="/profile/zhangsan">@张三</a> 你好'
    // 2. '哈喽 @zhangsan 你好' -> '哈喽 <a href="/profile/zhangsan">@zhangsan</a> 你好'
    obj.contentFormat = obj.contentFormat.replace(
        REG_FOR_AT_WHO,
        (matchStr, nickName, userName1, userName2) => {
            // 如果是第一种格式，userName1 有值，nickName 有值
            // 如果是第二种格式，只有 userName2 有值
            const userName = userName1 || userName2
            const displayName = nickName || userName2
            return `<a href="/profile/${userName}">@${displayName}</a>`
        }
    )

    // 添加纯文本摘要
    obj.contentSummary = _getPlainTextSummary(obj.content)

    return obj
}

/**
 * 格式化微博信息
 * @param {Array|Object} list 微博列表或者单个微博对象
 */
function formatBlog(list) {
    if (list == null) {
        return list
    }

    if (list instanceof Array) {
        // 数组
        return list.map(_formatDBTime).map(_formatContent)
    }
    // 对象
    let result = list
    result = _formatDBTime(result)
    result = _formatContent(result)
    return result
}

/**
 * 格式化评论信息
 * @param {Array|Object} list 评论列表或者单个评论对象
 */
function formatComment(list) {
    if (list == null) {
        return list
    }

    if (list instanceof Array) {
        // 数组
        return list.map(_formatDBTime)
    }
    // 对象
    let result = list
    result = _formatDBTime(result)
    return result
}

module.exports = {
    formatUser,
    formatBlog,
    formatComment
}
