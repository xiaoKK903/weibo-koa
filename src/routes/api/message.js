/**
 * @description 私信 API 路由
 * @author milk
 */

const router = require('koa-router')()
const { loginCheck } = require('../../middlewares/loginChecks')
const { genValidator } = require('../../middlewares/validator')
const {
    create,
    getList,
    getHistory,
    getUnreadCount,
    markAsRead,
    checkCanSend
} = require('../../controller/message')

router.prefix('/api/message')

router.post('/create', loginCheck, async (ctx, next) => {
    const { toUserId, content } = ctx.request.body
    ctx.body = await create(ctx, { toUserId, content })
})

router.get('/list', loginCheck, async (ctx, next) => {
    ctx.body = await getList(ctx)
})

router.get('/history', loginCheck, async (ctx, next) => {
    const { targetUserId, pageIndex, pageSize } = ctx.query
    ctx.body = await getHistory(ctx, { targetUserId, pageIndex, pageSize })
})

router.get('/unread-count', loginCheck, async (ctx, next) => {
    ctx.body = await getUnreadCount(ctx)
})

router.post('/mark-read', loginCheck, async (ctx, next) => {
    const { targetUserId } = ctx.request.body
    ctx.body = await markAsRead(ctx, { targetUserId })
})

router.get('/check-can-send', loginCheck, async (ctx, next) => {
    const { targetUserId } = ctx.query
    ctx.body = await checkCanSend(ctx, { targetUserId })
})

module.exports = router
