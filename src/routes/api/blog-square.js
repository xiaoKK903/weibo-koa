/**
 * @description 广场 API 路由
 * @author milk
 */

const router = require('koa-router')()
const { loginCheck } = require('../../middlewares/loginChecks')
const { getSquareBlogList } = require('../../controller/blog-square')
const { getBlogListStr } = require('../../utils/blog')

router.prefix('/api/square')

// 加载更多（支持搜索）
router.get('/loadMore/:pageIndex', loginCheck, async (ctx, next) => {
    let { pageIndex } = ctx.params
    pageIndex = parseInt(pageIndex)  // 转换 number 类型
    const { keyword } = ctx.query
    const userId = ctx.session.userInfo?.id
    const result = await getSquareBlogList(pageIndex, keyword, userId)
    // 渲染模板
    result.data.blogListTpl = getBlogListStr(result.data.blogList)

    ctx.body = result
})

// 搜索接口
router.get('/search', loginCheck, async (ctx, next) => {
    let { keyword, pageIndex = 0 } = ctx.query
    pageIndex = parseInt(pageIndex)
    const userId = ctx.session.userInfo?.id
    const result = await getSquareBlogList(pageIndex, keyword, userId)
    
    ctx.body = result
})

module.exports = router
