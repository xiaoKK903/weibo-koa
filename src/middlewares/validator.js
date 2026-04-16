/**
 * @description json schema 验证中间件
 * @author milk
 */

const { ErrorModel } = require("../model/ResModel");
const { jsonSchemaFileInfo } = require("../model/ErrorInfo");

/**
 * 生成 json schema 验证的中间件
 * @param {function} validateFn 验证函数
 */
function genValidator(validateFn) {
  // 定义中间件函数
  async function validator(ctx, next) {
    console.log('=== genValidator middleware ===');
    console.log('ctx.request.body:', ctx.request.body);
    const data = ctx.request.body;
    const error = validateFn(data);
    console.log('Validation error:', error);
    if (error) {
      // 验证失败
      ctx.body = new ErrorModel(jsonSchemaFileInfo);
      return;
    }
    // 验证成功，继续
    await next();
  }
  // 返回中间件
  return validator;
}

module.exports = {
  genValidator,
};
