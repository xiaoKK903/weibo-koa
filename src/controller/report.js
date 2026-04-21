/**
 * @description 举报控制器
 * @author milk
 */

const { createReport, getReportRecords } = require('../services/report')
const { TARGET_TYPE, REPORT_TYPE } = require('../services/report')
const { Blog, Comment } = require('../db/model/index')

/**
 * 创建举报
 * @param {Object} ctx Koa上下文
 */
async function createReportCtrl(ctx) {
    const { targetType, targetId, reportType, content } = ctx.request.body
    const { id: reporterId } = ctx.session.userInfo

    // 验证参数
    if (!targetType || !targetId || !reportType) {
        ctx.error('参数错误', 400)
        return
    }

    // 验证目标类型
    if (!Object.values(TARGET_TYPE).includes(targetType)) {
        ctx.error('无效的举报目标类型', 400)
        return
    }

    // 验证举报类型
    if (!Object.values(REPORT_TYPE).includes(reportType)) {
        ctx.error('无效的举报类型', 400)
        return
    }

    // 获取被举报人ID
    let reportedUserId
    if (targetType === TARGET_TYPE.BLOG) {
        const blog = await Blog.findOne({ where: { id: targetId } })
        if (!blog) {
            ctx.error('微博不存在', 404)
            return
        }
        reportedUserId = blog.userId
    } else if (targetType === TARGET_TYPE.COMMENT) {
        const comment = await Comment.findOne({ where: { id: targetId } })
        if (!comment) {
            ctx.error('评论不存在', 404)
            return
        }
        reportedUserId = comment.userId
    }

    // 不能举报自己
    if (reporterId === reportedUserId) {
        ctx.error('不能举报自己', 400)
        return
    }

    // 创建举报
    const result = await createReport({
        reporterId,
        reportedUserId,
        targetType,
        targetId,
        reportType,
        content
    })

    if (!result.success) {
        ctx.error(result.message, 400)
        return
    }

    ctx.success({ reportId: result.reportId }, '举报成功')
}

/**
 * 获取用户的举报记录
 * @param {Object} ctx Koa上下文
 */
async function getReportRecordsCtrl(ctx) {
    const { pageIndex = 0, pageSize = 10 } = ctx.query
    const { id: userId } = ctx.session.userInfo

    const result = await getReportRecords(userId, {
        pageIndex: parseInt(pageIndex),
        pageSize: parseInt(pageSize)
    })

    ctx.success(result, '获取举报记录成功')
}

/**
 * 获取举报类型列表
 * @param {Object} ctx Koa上下文
 */
async function getReportTypeListCtrl(ctx) {
    const reportTypeList = [
        { value: REPORT_TYPE.PORNOGRAPHY, label: '色情' },
        { value: REPORT_TYPE.VIOLENCE, label: '暴力' },
        { value: REPORT_TYPE.ILLEGAL, label: '违法' },
        { value: REPORT_TYPE.ADVERTISING, label: '广告' },
        { value: REPORT_TYPE.OTHER, label: '其他' }
    ]

    ctx.success({ reportTypeList }, '获取举报类型列表成功')
}

module.exports = {
    createReportCtrl,
    getReportRecordsCtrl,
    getReportTypeListCtrl
}