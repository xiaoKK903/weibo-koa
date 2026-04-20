/**
 * @description 草稿箱 API 路由
 * @author milk
 */

const router = require("koa-router")();
const {
    saveDraft,
    getDraft,
    deleteDraft,
    clearAllDrafts,
    getDraftList
} = require("../../controller/draft");
const { loginCheck } = require("../../middlewares/loginChecks");

// 获取草稿
router.get("/api/draft", loginCheck, async (ctx, next) => {
    ctx.body = await getDraft(ctx.session.userInfo.id);
});

// 保存草稿
router.post("/api/draft/save", loginCheck, async (ctx, next) => {
    const { content, image } = ctx.request.body;
    ctx.body = await saveDraft(ctx.session.userInfo.id, content, image);
});

// 删除草稿
router.post("/api/draft/delete", loginCheck, async (ctx, next) => {
    const { draftId } = ctx.request.body;
    ctx.body = await deleteDraft(ctx.session.userInfo.id, draftId);
});

// 清空所有草稿
router.post("/api/draft/clear", loginCheck, async (ctx, next) => {
    ctx.body = await clearAllDrafts(ctx.session.userInfo.id);
});

// 获取草稿列表
router.get("/api/draft/list", loginCheck, async (ctx, next) => {
    const { pageIndex = 0, pageSize = 10 } = ctx.query;
    ctx.body = await getDraftList(
        ctx.session.userInfo.id,
        parseInt(pageIndex),
        parseInt(pageSize)
    );
});

module.exports = router;
