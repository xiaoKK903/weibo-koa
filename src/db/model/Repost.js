/**
 * @description 转发数据模型
 * @author milk
 */

const seq = require('../seq')
const { INTEGER, DATE } = require('../types')

const Repost = seq.define('repost', {
    userId: {
        type: INTEGER,
        allowNull: false,
        comment: '转发者用户 ID'
    },
    blogId: {
        type: INTEGER,
        allowNull: false,
        comment: '转发后生成的新微博 ID'
    },
    sourceBlogId: {
        type: INTEGER,
        allowNull: false,
        comment: '被直接转发的微博 ID'
    },
    sourceUserId: {
        type: INTEGER,
        allowNull: false,
        comment: '被直接转发的微博作者 ID'
    },
    rootBlogId: {
        type: INTEGER,
        allowNull: false,
        comment: '最原始的微博 ID（转发链路的源头）'
    },
    rootUserId: {
        type: INTEGER,
        allowNull: false,
        comment: '最原始的微博作者 ID'
    },
    repostLevel: {
        type: INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: '转发层级，1 表示直接转发原始微博'
    },
    deletedAt: {
        type: DATE,
        allowNull: true,
        comment: '软删除时间戳，null 表示未删除'
    }
})

module.exports = Repost
