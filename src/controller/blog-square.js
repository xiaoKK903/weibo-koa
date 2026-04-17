/**
 * @description 广场页 controller
 * @author milk
 */

const { PAGE_SIZE } = require("../conf/constant");
const { SuccessModel } = require("../model/ResModel");
const { getSquareCacheList } = require("../cache/blog");

/**
 * 获取广场的微博列表
 * @param {number} pageIndex pageIndex
 * @param {string} keyword 搜索关键词
 * @param {number} userId 当前用户ID
 */
async function getSquareBlogList(pageIndex = 0, keyword = null, userId = null) {
  const result = await getSquareCacheList(pageIndex, PAGE_SIZE, keyword, userId);
  const blogList = result.blogList;

  // 拼接返回数据
  return new SuccessModel({
    isEmpty: blogList.length === 0,
    blogList,
    pageSize: PAGE_SIZE,
    pageIndex,
    count: result.count,
    keyword,
  });
}

module.exports = {
  getSquareBlogList,
};
