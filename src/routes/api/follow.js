/**
 * @description 关注 API 路由
 * @author milk
 */

const router = require("koa-router")();
const { follow, unfollow, checkFollow, getUserFollowStats, getUserFollowingList, getUserFollowerList } = require("../../controller/follow");
const { loginCheck } = require("../../middlewares/loginChecks");

router.prefix("/api/follow");

// 关注用户
router.post("/create", loginCheck, async (ctx, next) => {
  const { followingId } = ctx.request.body;
  ctx.body = await follow(ctx, followingId);
});

// 取消关注用户
router.post("/cancel", loginCheck, async (ctx, next) => {
  const { followingId } = ctx.request.body;
  ctx.body = await unfollow(ctx, followingId);
});

// 检查关注状态
router.post("/check", loginCheck, async (ctx, next) => {
  const { followingId } = ctx.request.body;
  ctx.body = await checkFollow(ctx, followingId);
});

// 获取用户的关注数和粉丝数
router.get("/stats/:userId", async (ctx, next) => {
  const { userId } = ctx.params;
  ctx.body = await getUserFollowStats(userId);
});

// 获取用户的关注列表
router.get("/following/:userId", async (ctx, next) => {
  const { userId } = ctx.params;
  ctx.body = await getUserFollowingList(parseInt(userId));
});

// 获取用户的粉丝列表
router.get("/follower/:userId", async (ctx, next) => {
  const { userId } = ctx.params;
  ctx.body = await getUserFollowerList(parseInt(userId));
});

module.exports = router;
