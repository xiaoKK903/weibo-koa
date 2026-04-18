/**
 * @description 首页 controller
 * @author milk
 */

const xss = require("xss");
const { createBlog, getFollowersBlogList } = require("../services/blog");
const { SuccessModel, ErrorModel } = require("../model/ResModel");
const { createBlogFailInfo, duplicateContentInfo, sensitiveContentInfo } = require("../model/ErrorInfo");
const { PAGE_SIZE, REG_FOR_AT_WHO } = require("../conf/constant");
const { getUserInfo } = require("../services/user");
const { createAtReminder } = require("../services/at");
const { contentSecurityCheck } = require("../middlewares/contentSecurity");

/**
 * 创建微博
 * @param {Object} param0 创建微博所需的数据 { userId, content, image }
 */
async function create({ userId, content, image }) {
  const securityCheck = await contentSecurityCheck(userId, content, 'blog');
  
  if (!securityCheck.pass) {
    if (securityCheck.errorType === 'sensitive') {
      return new ErrorModel(sensitiveContentInfo);
    }
    if (securityCheck.errorType === 'duplicate') {
      return new ErrorModel(duplicateContentInfo);
    }
  }

  const atUserNameList = [];
  content = content.replace(REG_FOR_AT_WHO, (matchStr, nickName, userName1, userName2) => {
    const userName = userName1 || userName2;
    if (userName) {
      atUserNameList.push(userName);
    }
    return matchStr;
  });

  const atUserList = await Promise.all(
    atUserNameList.map((userName) => getUserInfo(userName)),
  );

  const atUserIdList = atUserList.filter(user => user).map((user) => user.id);

  try {
    const blog = await createBlog({
      userId,
      content: xss(content),
      image,
    });

    if (atUserIdList.length > 0) {
      await createAtReminder(userId, atUserIdList, blog.id, null, 'blog');
    }

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
