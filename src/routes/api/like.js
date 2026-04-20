/**
 * @description 点赞 API 路由
 * @author milk
 */

const router = require("koa-router")();
const { like, cancelLike, getLikes, checkLike } = require("../../controller/like");
const { loginCheck } = require("../../middlewares/loginChecks");

// 点赞微博 - 前端调用路径
router.post("/api/blog/like", loginCheck, async (ctx, next) => {
  const { blogId } = ctx.request.body;
  ctx.body = await like(ctx, blogId);
});

// 取消点赞 - 前端调用路径
router.post("/api/blog/unlike", loginCheck, async (ctx, next) => {
  const { blogId } = ctx.request.body;
  ctx.body = await cancelLike(ctx, blogId);
});

// 原路由兼容
router.post("/api/like/create", loginCheck, async (ctx, next) => {
  const { blogId } = ctx.request.body;
  ctx.body = await like(ctx, blogId);
});

router.post("/api/like/cancel", loginCheck, async (ctx, next) => {
  const { blogId } = ctx.request.body;
  ctx.body = await cancelLike(ctx, blogId);
});

router.get("/api/like/list", loginCheck, async (ctx, next) => {
  const { pageIndex = 0, pageSize = 10 } = ctx.query;
  ctx.body = await getLikes(ctx, parseInt(pageIndex), parseInt(pageSize));
});

router.post("/api/like/check", loginCheck, async (ctx, next) => {
  const { blogId } = ctx.request.body;
  ctx.body = await checkLike(ctx, blogId);
});

module.exports = router;