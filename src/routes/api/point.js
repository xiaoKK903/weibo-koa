/**
 * @description 积分 API 路由
 * @author milk
 */

const router = require("koa-router")();
const {
    getCurrentUserLevelInfo,
    getUserLevelInfoByUserId,
    getDailyStats,
    getHistory
} = require("../../controller/point");
const { loginCheck } = require("../../middlewares/loginChecks");

router.get("/api/point/level", loginCheck, async (ctx, next) => {
    ctx.body = await getCurrentUserLevelInfo(ctx);
});

router.get("/api/point/level/:userId", async (ctx, next) => {
    ctx.body = await getUserLevelInfoByUserId(ctx);
});

router.get("/api/point/daily-stats", loginCheck, async (ctx, next) => {
    ctx.body = await getDailyStats(ctx);
});

router.get("/api/point/history", loginCheck, async (ctx, next) => {
    ctx.body = await getHistory(ctx);
});

module.exports = router;