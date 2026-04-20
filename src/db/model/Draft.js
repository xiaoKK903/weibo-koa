/**
 * @description 草稿数据模型
 * @author milk
 */

const seq = require('../seq')
const { INTEGER, TEXT, DATE } = require('../types')

const Draft = seq.define('draft', {
    userId: {
        type: INTEGER,
        allowNull: false,
        comment: '用户 ID'
    },
    content: {
        type: TEXT,
        comment: '草稿内容（HTML格式）'
    },
    image: {
        type: TEXT,
        comment: '图片地址，多张图片用逗号分隔'
    },
    lastSaveAt: {
        type: DATE,
        allowNull: false,
        comment: '最后保存时间'
    }
}, {
    indexes: [
        {
            fields: ['userId'],
            comment: '用户ID索引，用于快速查询用户草稿列表'
        },
        {
            fields: ['userId', 'lastSaveAt'],
            comment: '用户ID和保存时间联合索引'
        }
    ]
})

module.exports = Draft
