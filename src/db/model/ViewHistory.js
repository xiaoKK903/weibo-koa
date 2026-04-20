/**
 * @description 浏览历史模型
 * @author milk
 */

const seq = require('../seq')
const { INTEGER } = require('../types')

const ViewHistory = seq.define('viewHistory', {
    userId: {
        type: INTEGER,
        allowNull: false,
        comment: '用户ID'
    },
    blogId: {
        type: INTEGER,
        allowNull: false,
        comment: '微博ID'
    }
}, {
    indexes: [
        {
            unique: true,
            fields: ['userId', 'blogId'],
            comment: '用户和微博的组合唯一索引，防止重复记录'
        },
        {
            fields: ['userId', 'createdAt'],
            comment: '用户ID和创建时间的联合索引，用于快速查询浏览历史'
        }
    ]
})

module.exports = ViewHistory
