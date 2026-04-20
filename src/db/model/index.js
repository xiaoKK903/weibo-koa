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
const At = require('./At')
const ViewHistory = require('./ViewHistory')
const Draft = require('./Draft')

Blog.belongsTo(User, {
    foreignKey: 'userId'
})

// 评论关联
Comment.belongsTo(User, {
    foreignKey: 'userId'
})

Comment.belongsTo(User, {
    foreignKey: 'replyUserId',
    as: 'replyUser'
})

Comment.belongsTo(Blog, {
    foreignKey: 'blogId'
})

// 评论自关联（楼中楼）
Comment.belongsTo(Comment, {
    foreignKey: 'parentId',
    as: 'parent'
})

Comment.hasMany(Comment, {
    foreignKey: 'parentId',
    as: 'children'
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

Like.belongsTo(Comment, {
    foreignKey: 'commentId'
})

User.hasMany(Like, {
    foreignKey: 'userId'
})

Blog.hasMany(Like, {
    foreignKey: 'blogId'
})

Comment.hasMany(Like, {
    foreignKey: 'commentId'
})

// @提醒 关联
At.belongsTo(User, {
    foreignKey: 'fromUserId',
    as: 'fromUser'
})

At.belongsTo(User, {
    foreignKey: 'toUserId',
    as: 'toUser'
})

At.belongsTo(Blog, {
    foreignKey: 'blogId'
})

At.belongsTo(Comment, {
    foreignKey: 'commentId'
})

User.hasMany(At, {
    foreignKey: 'fromUserId',
    as: 'fromUserAts'
})

User.hasMany(At, {
    foreignKey: 'toUserId',
    as: 'toUserAts'
})

Blog.hasMany(At, {
    foreignKey: 'blogId'
})

Comment.hasMany(At, {
    foreignKey: 'commentId'
})

ViewHistory.belongsTo(User, {
    foreignKey: 'userId'
})

ViewHistory.belongsTo(Blog, {
    foreignKey: 'blogId'
})

User.hasMany(ViewHistory, {
    foreignKey: 'userId'
})

Blog.hasMany(ViewHistory, {
    foreignKey: 'blogId'
})

Draft.belongsTo(User, {
    foreignKey: 'userId'
})

User.hasMany(Draft, {
    foreignKey: 'userId'
})

module.exports = {
    User,
    Blog,
    Comment,
    Collect,
    Follow,
    Like,
    At,
    ViewHistory,
    Draft
}
