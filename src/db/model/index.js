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
const UserLevel = require('./UserLevel')
const PointLog = require('./PointLog')
const Report = require('./Report')
const Block = require('./Block')
const Repost = require('./Repost')
const Topic = require('./Topic')
const BlogTopic = require('./BlogTopic')
const Conversation = require('./Conversation')
const Message = require('./Message')

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

// 用户等级关联
UserLevel.belongsTo(User, {
    foreignKey: 'userId'
})

User.hasOne(UserLevel, {
    foreignKey: 'userId'
})

// 积分记录关联
PointLog.belongsTo(User, {
    foreignKey: 'userId'
})

User.hasMany(PointLog, {
    foreignKey: 'userId'
})

// 举报关联
Report.belongsTo(User, {
    foreignKey: 'reporterId',
    as: 'reporter'
})

Report.belongsTo(User, {
    foreignKey: 'reportedUserId',
    as: 'reportedUser'
})

Report.belongsTo(Blog, {
    foreignKey: 'targetId',
    as: 'targetBlog'
})

Report.belongsTo(Comment, {
    foreignKey: 'targetId',
    as: 'targetComment'
})

User.hasMany(Report, {
    foreignKey: 'reporterId',
    as: 'reportedRecords'
})

User.hasMany(Report, {
    foreignKey: 'reportedUserId',
    as: 'beingReportedRecords'
})

Blog.hasMany(Report, {
    foreignKey: 'targetId',
    as: 'reportRecords'
})

Comment.hasMany(Report, {
    foreignKey: 'targetId',
    as: 'reportRecords'
})

// 屏蔽关联
Block.belongsTo(User, {
    foreignKey: 'blockerId',
    as: 'blocker'
})

Block.belongsTo(User, {
    foreignKey: 'blockedId',
    as: 'blocked'
})

User.hasMany(Block, {
    foreignKey: 'blockerId',
    as: 'blockedUsers'
})

User.hasMany(Block, {
    foreignKey: 'blockedId',
    as: 'beingBlockedUsers'
})

// 转发关联
Repost.belongsTo(User, {
    foreignKey: 'userId',
    as: 'repostUser'
})

Repost.belongsTo(User, {
    foreignKey: 'sourceUserId',
    as: 'sourceUser'
})

Repost.belongsTo(User, {
    foreignKey: 'rootUserId',
    as: 'rootUser'
})

Repost.belongsTo(Blog, {
    foreignKey: 'blogId',
    as: 'repostBlog'
})

Repost.belongsTo(Blog, {
    foreignKey: 'sourceBlogId',
    as: 'sourceBlog'
})

Repost.belongsTo(Blog, {
    foreignKey: 'rootBlogId',
    as: 'rootBlog'
})

User.hasMany(Repost, {
    foreignKey: 'userId',
    as: 'myReposts'
})

Blog.hasMany(Repost, {
    foreignKey: 'blogId',
    as: 'repostRecords'
})

Blog.hasMany(Repost, {
    foreignKey: 'sourceBlogId',
    as: 'directReposts'
})

Blog.hasMany(Repost, {
    foreignKey: 'rootBlogId',
    as: 'allReposts'
})

BlogTopic.belongsTo(Blog, {
    foreignKey: 'blogId'
})

BlogTopic.belongsTo(Topic, {
    foreignKey: 'topicId'
})

Blog.belongsToMany(Topic, {
    through: BlogTopic,
    foreignKey: 'blogId',
    otherKey: 'topicId',
    as: 'topics'
})

Topic.belongsToMany(Blog, {
    through: BlogTopic,
    foreignKey: 'topicId',
    otherKey: 'blogId',
    as: 'blogs'
})

Blog.hasMany(BlogTopic, {
    foreignKey: 'blogId'
})

Topic.hasMany(BlogTopic, {
    foreignKey: 'topicId'
})

Conversation.belongsTo(User, {
    foreignKey: 'user1Id',
    as: 'user1'
})

Conversation.belongsTo(User, {
    foreignKey: 'user2Id',
    as: 'user2'
})

Message.belongsTo(User, {
    foreignKey: 'fromUserId',
    as: 'fromUser'
})

Message.belongsTo(User, {
    foreignKey: 'toUserId',
    as: 'toUser'
})

Message.belongsTo(Conversation, {
    foreignKey: 'conversationId'
})

User.hasMany(Message, {
    foreignKey: 'fromUserId',
    as: 'sentMessages'
})

User.hasMany(Message, {
    foreignKey: 'toUserId',
    as: 'receivedMessages'
})

Conversation.hasMany(Message, {
    foreignKey: 'conversationId'
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
    Draft,
    UserLevel,
    PointLog,
    Report,
    Block,
    Repost,
    Topic,
    BlogTopic,
    Conversation,
    Message
}
