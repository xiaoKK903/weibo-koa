/**
 * @description 回收站 API 路由
 * @author milk
 */

const router = require("koa-router")();
const {
    deleteBlog,
    restoreBlog,
    permanentDeleteBlog,
    getRecycleList
} = require("../../controller/recycle");
const { loginCheck } = require("../../middlewares/loginChecks");

// 获取回收站列表
router.get("/api/recycle/list", loginCheck, async (ctx, next) => {
    const { pageIndex = 0, pageSize = 10 } = ctx.query;
    ctx.body = await getRecycleList(
        ctx.session.userInfo.id,
        parseInt(pageIndex),
        parseInt(pageSize)
    );
});

// 删除微博（移到回收站）
router.post("/api/blog/delete", loginCheck, async (ctx, next) => {
    const { blogId } = ctx.request.body;
    ctx.body = await deleteBlog(blogId, ctx.session.userInfo.id);
});

// 从回收站恢复微博
router.post("/api/recycle/restore", loginCheck, async (ctx, next) => {
    const { blogId } = ctx.request.body;
    ctx.body = await restoreBlog(blogId, ctx.session.userInfo.id);
});

// 从回收站彻底删除微博
router.post("/api/recycle/delete", loginCheck, async (ctx, next) => {
    const { blogId } = ctx.request.body;
    ctx.body = await permanentDeleteBlog(blogId, ctx.session.userInfo.id);
});

module.exports = router;
