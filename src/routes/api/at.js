/**
 * @description @提醒 API 路由
 * @author milk
 */

const router = require('koa-router')()
const { loginCheck } = require('../../middlewares/loginChecks')
const { getAtList, getUnreadCount, markSingleAsRead, markAllAsReadController } = require('../../controller/at')

router.prefix('/api/at')

// 获取 @提醒列表
router.get('/list', loginCheck, async (ctx, next) => {
    const { pageIndex = 0, pageSize = 10, onlyUnread = false } = ctx.query
    ctx.body = await getAtList(
        ctx,
        parseInt(pageIndex),
        parseInt(pageSize),
        onlyUnread === 'true' || onlyUnread === true
    )
})

// 获取未读 @提醒数量
router.get('/unread-count', loginCheck, async (ctx, next) => {
    ctx.body = await getUnreadCount(ctx)
})

// 标记单条 @提醒 为已读
router.post('/mark-read', loginCheck, async (ctx, next) => {
    const { atId } = ctx.request.body
    ctx.body = await markSingleAsRead(ctx, parseInt(atId))
})

// 标记所有 @提醒 为已读
router.post('/mark-all-read', loginCheck, async (ctx, next) => {
    ctx.body = await markAllAsReadController(ctx)
})

module.exports = router