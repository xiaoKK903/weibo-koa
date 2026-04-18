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
    multiples: true,
    keepExtensions: true,
    maxFileSize: 1024 * 1024 * 10 // 10MB
}), async (ctx, next) => {
    let files = ctx.req.files['file']
    if (!files) {
        return
    }
    
    if (!Array.isArray(files)) {
        files = [files]
    }
    
    const results = []
    for (const file of files) {
        const { size, path, name, type } = file
        const result = await saveFile({
            name,
            type,
            size,
            filePath: path
        })
        results.push(result)
    }
    
    if (results.length === 1) {
        ctx.body = results[0]
    } else {
        const ErrorModel = require('../../model/ResModel').ErrorModel
        const SuccessModel = require('../../model/ResModel').SuccessModel
        
        const successResults = results.filter(r => r.errno === 0)
        if (successResults.length === 0) {
            ctx.body = results[0]
        } else if (successResults.length === results.length) {
            ctx.body = new SuccessModel({
                urls: successResults.map(r => r.data.url)
            })
        } else {
            ctx.body = new SuccessModel({
                urls: successResults.map(r => r.data.url),
                failedCount: results.length - successResults.length
            })
        }
    }
})

module.exports = router
