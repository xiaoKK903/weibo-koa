/**
 * @description 数据模型入口文件
 * @author milk
 */

const User = require('./User')
const Blog = require('./Blog')
const Comment = require('./Comment')
const Collect = require('./Collect')

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

// 收藏关联
Collect.belongsTo(User, {
    foreignKey: 'userId'
})

Collect.belongsTo(Blog, {
    foreignKey: 'blogId'
})

User.hasMany(Collect, {
    foreignKey: 'userId'
})

Blog.hasMany(Collect, {
    foreignKey: 'blogId'
})

module.exports = {
    User,
    Blog,
    Comment,
    Collect
}
