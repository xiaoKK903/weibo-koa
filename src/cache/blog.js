/**
 * @description 微博缓存层
 * @author milk
 */

const { get, set } = require("./_redis");
const { getBlogListByUser } = require("../services/blog");

// redis key 前缀
const KEY_PREFIX = "weibo:square:";

/**
 * 获取广场列表的缓存
 * @param {number} pageIndex pageIndex
 * @param {number} pageSize pageSize
 * @param {string} keyword 搜索关键词
 * @param {number} userId 当前用户ID
 */
async function getSquareCacheList(pageIndex, pageSize, keyword = null, userId = null) {
  // 如果有搜索关键词，不使用缓存，直接查询数据库
  if (keyword) {
    return await getBlogListByUser({ pageIndex, pageSize, keyword, userId });
  }

  const key = `${KEY_PREFIX}${pageIndex}_${pageSize}`;

  // 尝试获取缓存
  const cacheResult = await get(key);
  if (cacheResult != null) {
    // 获取缓存成功
    return cacheResult;
  }

  // 没有缓存，则读取数据库
  const result = await getBlogListByUser({ pageIndex, pageSize, userId });

  // 设置缓存，过期时间 1min
  set(key, result, 60);

  return result;
}

module.exports = {
  getSquareCacheList,
};
