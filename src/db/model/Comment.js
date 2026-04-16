/**
 * @description 评论数据模型
 * @author milk
 */

const seq = require("../seq");
const { STRING, INTEGER } = require("../types");

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
});

// 关联关系
Comment.belongsTo(require("./User"), {
  foreignKey: "userId",
  as: "user",
});

Comment.belongsTo(require("./Blog"), {
  foreignKey: "blogId",
  as: "blog",
});

module.exports = Comment;
