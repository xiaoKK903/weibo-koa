/**
 * @description 登录验证的中间件
 * @author milk
 */

const { ErrorModel } = require("../model/ResModel");
const { loginCheckFailInfo } = require("../model/ErrorInfo");

/**
 * API 登录验证
 * @param {Object} ctx ctx
 * @param {function} next next
 */
async function loginCheck(ctx, next) {
  console.log('=== loginCheck middleware ===');
  console.log('ctx.session:', ctx.session);
  console.log('ctx.session.userInfo:', ctx.session ? ctx.session.userInfo : 'session not exist');
  if (ctx.session && ctx.session.userInfo) {
    // 已登录
    await next();
    return;
  }
  // 未登录
  ctx.body = new ErrorModel(loginCheckFailInfo);
  return;
}

/**
 * 页面登录验证
 * @param {Object} ctx ctx
 * @param {function} next next
 */
async function loginRedirect(ctx, next) {
  if (ctx.session && ctx.session.userInfo) {
    // 已登录
    await next();
    return;
  }
  // 未登录
  const curUrl = ctx.url;
  ctx.redirect("/login?url=" + encodeURIComponent(curUrl));
}

module.exports = {
  loginCheck,
  loginRedirect,
};
