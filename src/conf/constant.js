/**
 * @description 常量集合
 * @author milk
 */

module.exports = {
  DEFAULT_PICTURE: "https://dwz.cn/rnTnftZs",
  PAGE_SIZE: 5,

  // 正则表达式，匹配 '@昵称 - userName' 或 '@userName'
  REG_FOR_AT_WHO: /@([^\s@]+?)\s-\s(\w+?)\b|@(\w+?)\b/g,

  // 重复内容检查的时间间隔（秒）
  DUPLICATE_CHECK_INTERVAL: 60,
};
