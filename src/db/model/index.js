/**
 * @description 数据模型入口文件
 * @author milk
 */

const User = require('./User')
const Blog = require('./Blog')
const Comment = require('./Comment')

Blog.belongsTo(User, {
    foreignKey: 'userId'
})

// 评论关联
Comment.belongsTo(User, {
    foreignKey: 'userId'
})

Comment.belongsTo(Blog, {
    foreignKey: 'blogId'
})

User.hasMany(Comment, {
    foreignKey: 'userId'
})

Blog.hasMany(Comment, {
    foreignKey: 'blogId'
})

module.exports = {
    User,
    Blog,
    Comment
}
