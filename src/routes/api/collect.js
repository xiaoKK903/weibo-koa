/**
 * @description 收藏 API 路由
 * @author milk
 */

const router = require("koa-router")();
const { collect, cancelCollect, getCollects, checkCollect } = require("../../controller/collect");
const { loginCheck } = require("../../middlewares/loginChecks");

// 收藏微博 - 前端调用路径
router.post("/api/blog/collect", loginCheck, async (ctx, next) => {
  const { blogId } = ctx.request.body;
  ctx.body = await collect(ctx, blogId);
});

// 取消收藏 - 前端调用路径
router.post("/api/blog/uncollect", loginCheck, async (ctx, next) => {
  const { blogId } = ctx.request.body;
  ctx.body = await cancelCollect(ctx, blogId);
});

// 原路由兼容
router.post("/api/collect/create", loginCheck, async (ctx, next) => {
  const { blogId } = ctx.request.body;
  ctx.body = await collect(ctx, blogId);
});

router.post("/api/collect/cancel", loginCheck, async (ctx, next) => {
  const { blogId } = ctx.request.body;
  ctx.body = await cancelCollect(ctx, blogId);
});

router.get("/api/collect/list", loginCheck, async (ctx, next) => {
  const { pageIndex = 0, pageSize = 10 } = ctx.query;
  ctx.body = await getCollects(ctx, parseInt(pageIndex), parseInt(pageSize));
});

router.post("/api/collect/check", loginCheck, async (ctx, next) => {
  const { blogId } = ctx.request.body;
  ctx.body = await checkCollect(ctx, blogId);
});

module.exports = router;