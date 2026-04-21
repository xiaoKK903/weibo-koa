/**
 * @description 话题数据模型
 * @author milk
 */

const seq = require('../seq')
const { INTEGER, STRING, DATE, Op } = require('../types')

const Topic = seq.define('topic', {
    name: {
        type: STRING(100),
        allowNull: false,
        unique: true,
        comment: '话题名称（不包含 # 符号）'
    },
    blogCount: {
        type: INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '该话题下的微博数量'
    },
    description: {
        type: STRING(500),
        allowNull: true,
        comment: '话题描述（可选）'
    },
    lastActivityAt: {
        type: DATE,
        allowNull: true,
        comment: '最后活动时间'
    },
    deletedAt: {
        type: DATE,
        allowNull: true,
        comment: '软删除时间戳，null 表示未删除'
    }
}, {
    indexes: [
        {
            unique: true,
            fields: ['name']
        },
        {
            fields: ['blogCount']
        },
        {
            fields: ['lastActivityAt']
        }
    ]
})

module.exports = Topic
