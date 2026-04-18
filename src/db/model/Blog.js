/**
 * @description 微博数据模型
 * @author milk
 */

const seq = require('../seq')
const { INTEGER, STRING, TEXT } = require('../types')

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
    }
})

module.exports = Blog
