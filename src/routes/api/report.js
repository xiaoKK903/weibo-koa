/**
 * @description 举报相关路由
 * @author milk
 */

const router = require('koa-router')()
const { createReportCtrl, getReportRecordsCtrl, getReportTypeListCtrl } = require('../../controller/report')
const { loginCheck } = require('../../middlewares/loginChecks')

// 前缀
router.prefix('/api/report')

// 创建举报
router.post('/create', loginCheck, createReportCtrl)

// 获取举报记录
router.get('/records', loginCheck, getReportRecordsCtrl)

// 获取举报类型列表
router.get('/types', loginCheck, getReportTypeListCtrl)

module.exports = router