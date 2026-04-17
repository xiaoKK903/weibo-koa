/**
 * @description 首页 controller
 * @author milk
 */

const xss = require("xss");
const { createBlog, getFollowersBlogList } = require("../services/blog");
const { SuccessModel, ErrorModel } = require("../model/ResModel");
const { createBlogFailInfo } = require("../model/ErrorInfo");
const { PAGE_SIZE, REG_FOR_AT_WHO } = require("../conf/constant");
const { getUserInfo } = require("../services/user");
const { createAtReminder } = require("../services/at");

/**
 * 创建微博
 * @param {Object} param0 创建微博所需的数据 { userId, content, image }
 */
async function create({ userId, content, image }) {
  // 分析并收集 content 中的 @ 用户
  // 支持两种格式：
  // 1. '@昵称 - userName' 格式，如 '哈喽 @李四 - lisi 你好'
  // 2. '@userName' 格式，如 '哈喽 @lisi 你好'
  const atUserNameList = [];
  content = content.replace(REG_FOR_AT_WHO, (matchStr, nickName, userName1, userName2) => {
    // 目的不是 replace 而是获取 userName
    // 如果是第一种格式，userName1 有值
    // 如果是第二种格式，userName2 有值
    const userName = userName1 || userName2;
    if (userName) {
      atUserNameList.push(userName);
    }
    return matchStr; // 替换不生效，预期
  });

  // 根据 @ 用户名查询用户信息
  const atUserList = await Promise.all(
    atUserNameList.map((userName) => getUserInfo(userName)),
  );

  // 根据用户信息，获取用户 id
  const atUserIdList = atUserList.filter(user => user).map((user) => user.id);

  try {
    // 创建微博
    const blog = await createBlog({
      userId,
      content: xss(content),
      image,
    });

    // 创建 @提醒
    if (atUserIdList.length > 0) {
      await createAtReminder(userId, atUserIdList, blog.id, null, 'blog');
    }

    // 返回
    return new SuccessModel(blog);
  } catch (ex) {
    console.error(ex.message, ex.stack);
    return new ErrorModel(createBlogFailInfo);
  }
}

/**
 * 获取首页微博列表
 * @param {number} userId userId
 * @param {number} pageIndex page index
 */
async function getHomeBlogList(userId, pageIndex = 0) {
  const result = await getFollowersBlogList({
    userId,
    pageIndex,
    pageSize: PAGE_SIZE,
  });
  const { count, blogList } = result;

  // 返回
  return new SuccessModel({
    isEmpty: blogList.length === 0,
    blogList,
    pageSize: PAGE_SIZE,
    pageIndex,
    count,
  });
}

module.exports = {
  create,
  getHomeBlogList,
};
