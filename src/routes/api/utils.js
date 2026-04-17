/**
 * @description utils api 路由
 * @author milk
 */

const router = require('koa-router')()
const { loginCheck } = require('../../middlewares/loginChecks')
const koaFrom = require('formidable-upload-koa')
const { saveFile } = require('../../controller/utils')

router.prefix('/api/utils')

// 上传图片
router.post('/upload', loginCheck, koaFrom({
    // 配置上传选项
    multiples: false,
    keepExtensions: true,
    maxFileSize: 1024 * 1024 * 10 // 10MB
}), async (ctx, next) => {
    const file = ctx.req.files['file']
    if (!file) {
        return
    }
    const { size, path, name, type } = file
    ctx.body = await saveFile({
        name,
        type,
        size,
        filePath: path
    })
})

module.exports = router
