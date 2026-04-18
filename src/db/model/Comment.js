/**
 * @description 评论数据模型
 * @author milk
 */

const seq = require("../seq");
const { STRING, INTEGER, BOOLEAN } = require("../types");

// comments
const Comment = seq.define("comment", {
  blogId: {
    type: INTEGER,
    allowNull: false,
    comment: "微博ID",
  },
  userId: {
    type: INTEGER,
    allowNull: false,
    comment: "用户ID",
  },
  content: {
    type: STRING,
    allowNull: false,
    comment: "评论内容",
  },
  parentId: {
    type: INTEGER,
    allowNull: true,
    comment: "父评论ID，null表示一级评论",
  },
  replyUserId: {
    type: INTEGER,
    allowNull: true,
    comment: "被回复的用户ID",
  },
  rootId: {
    type: INTEGER,
    allowNull: true,
    comment: "根评论ID，用于快速定位整个回复链",
  },
  isDeleted: {
    type: BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: "是否已删除",
  },
});

module.exports = Comment;
