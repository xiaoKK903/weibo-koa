/**
 * @description 屏蔽 API 路由
 * @author milk
 */

const router = require("koa-router")({ prefix: "/api/block" });
const { 
    block, 
    unblock, 
    checkBlock, 
    checkIsBlocked,
    getBlockedList, 
    getBlockedListCount 
} = require("../../controller/block");
const { loginCheck } = require("../../middlewares/loginChecks");

// 屏蔽用户
router.post("/create", loginCheck, async (ctx, next) => {
  const { blockedId } = ctx.request.body;
  ctx.body = await block(ctx, parseInt(blockedId));
});

// 取消屏蔽用户
router.post("/cancel", loginCheck, async (ctx, next) => {
  const { blockedId } = ctx.request.body;
  ctx.body = await unblock(ctx, parseInt(blockedId));
});

// 检查是否已屏蔽某用户
router.post("/check", loginCheck, async (ctx, next) => {
  const { blockedId } = ctx.request.body;
  ctx.body = await checkBlock(ctx, parseInt(blockedId));
});

// 检查是否被某用户屏蔽
router.post("/check-blocked", loginCheck, async (ctx, next) => {
  const { targetUserId } = ctx.request.body;
  ctx.body = await checkIsBlocked(ctx, parseInt(targetUserId));
});

// 获取已屏蔽用户列表
router.get("/list", loginCheck, async (ctx, next) => {
  ctx.body = await getBlockedList(ctx);
});

// 获取已屏蔽用户数
router.get("/count", loginCheck, async (ctx, next) => {
  ctx.body = await getBlockedListCount(ctx);
});

module.exports = router;
