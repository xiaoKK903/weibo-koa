/**
 * @description 收藏 API 路由
 * @author milk
 */

const router = require("koa-router")();
const { collect, cancelCollect, getCollects, checkCollect } = require("../../controller/collect");
const { loginCheck } = require("../../middlewares/loginChecks");

router.prefix("/api/collect");

// 收藏微博
router.post("/create", loginCheck, async (ctx, next) => {
  const { blogId } = ctx.request.body;
  ctx.body = await collect(ctx, blogId);
});

// 取消收藏
router.post("/cancel", loginCheck, async (ctx, next) => {
  const { blogId } = ctx.request.body;
  ctx.body = await cancelCollect(ctx, blogId);
});

// 获取用户收藏列表
router.get("/list", loginCheck, async (ctx, next) => {
  const { pageIndex = 0, pageSize = 10 } = ctx.query;
  ctx.body = await getCollects(ctx, parseInt(pageIndex), parseInt(pageSize));
});

// 检查用户是否收藏了指定微博
router.post("/check", loginCheck, async (ctx, next) => {
  const { blogId } = ctx.request.body;
  ctx.body = await checkCollect(ctx, blogId);
});

module.exports = router;