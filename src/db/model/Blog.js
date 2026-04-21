/**
 * @description 微博数据模型
 * @author milk
 */

const seq = require('../seq')
const { INTEGER, STRING, TEXT, DATE } = require('../types')
const { VISIBLE_TYPE } = require('../../conf/visibleType')

const Blog = seq.define('blog', {
    userId: {
        type: INTEGER,
        allowNull: false,
        comment: '用户 ID'
    },
    content: {
        type: TEXT,
        allowNull: false,
        comment: '微博内容'
    },
    image: {
        type: TEXT,
        comment: '图片地址，多张图片用逗号分隔'
    },
    deletedAt: {
        type: DATE,
        allowNull: true,
        comment: '软删除时间戳，null 表示未删除'
    },
    visibleType: {
        type: INTEGER,
        allowNull: false,
        defaultValue: VISIBLE_TYPE.PUBLIC,
        comment: '可见权限类型：0-公开，1-仅自己可见，2-仅粉丝可见'
    },
    isBlocked: {
        type: INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '是否被风控限流隐藏：0-正常，1-被隐藏'
    }
})

module.exports = Blog