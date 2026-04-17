/**
 * @description 点赞 API 路由
 * @author milk
 */

const router = require("koa-router")();
const { like, cancelLike, getLikes, checkLike } = require("../../controller/like");
const { loginCheck } = require("../../middlewares/loginChecks");

router.prefix("/api/like");

// 点赞微博
router.post("/create", loginCheck, async (ctx, next) => {
  const { blogId } = ctx.request.body;
  ctx.body = await like(ctx, blogId);
});

// 取消点赞
router.post("/cancel", loginCheck, async (ctx, next) => {
  const { blogId } = ctx.request.body;
  ctx.body = await cancelLike(ctx, blogId);
});

// 获取用户点赞列表
router.get("/list", loginCheck, async (ctx, next) => {
  const { pageIndex = 0, pageSize = 10 } = ctx.query;
  ctx.body = await getLikes(ctx, parseInt(pageIndex), parseInt(pageSize));
});

// 检查用户是否点赞了指定微博
router.post("/check", loginCheck, async (ctx, next) => {
  const { blogId } = ctx.request.body;
  ctx.body = await checkLike(ctx, blogId);
});

module.exports = router;