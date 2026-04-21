/**
 * @description 首页 controller
 * @author milk
 */

const xss = require("xss");
const { createBlog, getFollowersBlogList, updateBlogVisibleType } = require("../services/blog");
const { SuccessModel, ErrorModel } = require("../model/ResModel");
const { createBlogFailInfo, duplicateContentInfo, sensitiveContentInfo } = require("../model/ErrorInfo");
const { PAGE_SIZE, REG_FOR_AT_WHO } = require("../conf/constant");
const { getUserInfo } = require("../services/user");
const { createAtReminder } = require("../services/at");
const { contentSecurityCheck, setDuplicateCache } = require("../middlewares/contentSecurity");
const { addPoint } = require("../services/point");
const { ACTION_TYPES } = require("../conf/pointRules");
const { VISIBLE_TYPE, getVisibleTypeInfo, getVisibleTypeList } = require("../conf/visibleType");
const { extractTopics, associateBlogWithTopics } = require("../services/topic");

/**
 * 创建微博
 * @param {Object} param0 创建微博所需的数据 { userId, content, image, visibleType }
 */
async function create({ userId, content, image, visibleType = VISIBLE_TYPE.PUBLIC }) {
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
      visibleType
    });

    if (atUserIdList.length > 0) {
      await createAtReminder(userId, atUserIdList, blog.id, null, 'blog');
    }
    
    const topics = extractTopics(content);
    if (topics.length > 0) {
      await associateBlogWithTopics(blog.id, topics);
    }

    await setDuplicateCache(userId, securityCheck.normalizedContent, 'blog');

    addPoint(userId, ACTION_TYPES.BLOG, blog.id).catch(err => {
      console.error('[积分服务] 发布微博添加积分失败:', err.message);
    });

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

  return new SuccessModel({
    isEmpty: blogList.length === 0,
    blogList,
    pageSize: PAGE_SIZE,
    pageIndex,
    count,
  });
}

/**
 * 修改微博可见权限
 * @param {number} userId 用户ID
 * @param {number} blogId 微博ID
 * @param {number} visibleType 可见权限类型
 */
async function updateVisibleType(userId, blogId, visibleType) {
  const result = await updateBlogVisibleType(blogId, userId, visibleType)
  
  if (result.success) {
    return new SuccessModel({
      visibleType: result.visibleType,
      visibleTypeInfo: getVisibleTypeInfo(result.visibleType)
    })
  } else {
    return new ErrorModel({
      errno: 10009,
      message: result.message || '修改权限失败'
    })
  }
}

/**
 * 获取可见权限类型列表
 */
async function getVisibleTypeListCtrl() {
  return new SuccessModel({
    list: getVisibleTypeList()
  })
}

module.exports = {
  create,
  getHomeBlogList,
  updateVisibleType,
  getVisibleTypeListCtrl
};