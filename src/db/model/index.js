/**
 * @description 数据模型入口文件
 * @author milk
 */

const User = require('./User')
const Blog = require('./Blog')
const Comment = require('./Comment')
const Collect = require('./Collect')
const Follow = require('./Follow')
const Like = require('./Like')

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

// 关注关联
Follow.belongsTo(User, {
    foreignKey: 'followerId',
    as: 'follower'
})

Follow.belongsTo(User, {
    foreignKey: 'followingId',
    as: 'following'
})

User.hasMany(Follow, {
    foreignKey: 'followerId',
    as: 'followingUsers'
})

User.hasMany(Follow, {
    foreignKey: 'followingId',
    as: 'followerUsers'
})

// 点赞关联
Like.belongsTo(User, {
    foreignKey: 'userId'
})

Like.belongsTo(Blog, {
    foreignKey: 'blogId'
})

User.hasMany(Like, {
    foreignKey: 'userId'
})

Blog.hasMany(Like, {
    foreignKey: 'blogId'
})

module.exports = {
    User,
    Blog,
    Comment,
    Collect,
    Follow,
    Like
}
