/**
 * @description 浏览历史 API 路由
 * @author milk
 */

const router = require('koa-router')()
const { loginCheck } = require('../../middlewares/loginChecks')
const {
    getViewHistoryList,
    deleteViewHistory,
    clearAllViewHistory
} = require('../../controller/viewHistory')
const { ErrorModel } = require('../../model/ResModel')

router.prefix('/api/view-history')

router.get('/list', loginCheck, async (ctx, next) => {
    const { pageIndex = 0, pageSize = 10 } = ctx.query
    const { id: userId } = ctx.session.userInfo
    
    const pageIndexNum = parseInt(pageIndex)
    const pageSizeNum = parseInt(pageSize)
    
    const result = await getViewHistoryList(
        userId,
        isNaN(pageIndexNum) ? 0 : pageIndexNum,
        isNaN(pageSizeNum) ? 10 : pageSizeNum
    )
    
    ctx.body = result
})

router.post('/delete', loginCheck, async (ctx, next) => {
    const { id } = ctx.request.body
    const { id: userId } = ctx.session.userInfo
    
    const idNum = parseInt(id)
    if (isNaN(idNum)) {
        ctx.body = new ErrorModel({ errno: 400, message: '无效的记录 ID' })
        return
    }
    
    const result = await deleteViewHistory(idNum, userId)
    ctx.body = result
})

router.post('/clear', loginCheck, async (ctx, next) => {
    const { id: userId } = ctx.session.userInfo
    
    const result = await clearAllViewHistory(userId)
    ctx.body = result
})

module.exports = router
