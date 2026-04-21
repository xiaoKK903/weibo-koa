/**
 * @description 举报控制器
 * @author milk
 */

const { createReport, getReportRecords } = require('../services/report')
const { TARGET_TYPE, REPORT_TYPE } = require('../services/report')
const { Blog, Comment } = require('../db/model/index')
const { SuccessModel, ErrorModel } = require('../model/ResModel')

/**
 * 创建举报
 * @param {Object} ctx Koa上下文
 */
async function createReportCtrl(ctx) {
    try {
        const { targetType, targetId, reportType, content } = ctx.request.body
        const { id: reporterId } = ctx.session.userInfo

        if (!targetType || !targetId || !reportType) {
            ctx.body = new ErrorModel({ errno: -1, message: '参数错误' })
            return
        }

        if (!Object.values(TARGET_TYPE).includes(targetType)) {
            ctx.body = new ErrorModel({ errno: -1, message: '无效的举报目标类型' })
            return
        }

        if (!Object.values(REPORT_TYPE).includes(reportType)) {
            ctx.body = new ErrorModel({ errno: -1, message: '无效的举报类型' })
            return
        }

        let reportedUserId
        if (targetType === TARGET_TYPE.BLOG) {
            const blog = await Blog.findOne({ where: { id: targetId } })
            if (!blog) {
                ctx.body = new ErrorModel({ errno: -1, message: '微博不存在' })
                return
            }
            reportedUserId = blog.userId
        } else if (targetType === TARGET_TYPE.COMMENT) {
            const comment = await Comment.findOne({ where: { id: targetId } })
            if (!comment) {
                ctx.body = new ErrorModel({ errno: -1, message: '评论不存在' })
                return
            }
            reportedUserId = comment.userId
        }

        if (reporterId === reportedUserId) {
            ctx.body = new ErrorModel({ errno: -1, message: '不能举报自己' })
            return
        }

        const result = await createReport({
            reporterId,
            reportedUserId,
            targetType,
            targetId,
            reportType,
            content
        })

        if (!result.success) {
            ctx.body = new ErrorModel({ errno: -1, message: result.message })
            return
        }

        ctx.body = new SuccessModel({ reportId: result.reportId })
    } catch (error) {
        console.error('createReportCtrl error:', error)
        ctx.body = new ErrorModel({ errno: -1, message: '创建举报失败' })
    }
}

/**
 * 获取用户的举报记录
 * @param {Object} ctx Koa上下文
 */
async function getReportRecordsCtrl(ctx) {
    try {
        const { pageIndex = 0, pageSize = 10 } = ctx.query
        const { id: userId } = ctx.session.userInfo

        const result = await getReportRecords(userId, {
            pageIndex: parseInt(pageIndex),
            pageSize: parseInt(pageSize)
        })

        ctx.body = new SuccessModel(result)
    } catch (error) {
        console.error('getReportRecordsCtrl error:', error)
        ctx.body = new ErrorModel({ errno: -1, message: '获取举报记录失败' })
    }
}

/**
 * 获取举报类型列表
 * @param {Object} ctx Koa上下文
 */
async function getReportTypeListCtrl(ctx) {
    try {
        const reportTypeList = [
            { value: REPORT_TYPE.PORNOGRAPHY, label: '色情' },
            { value: REPORT_TYPE.VIOLENCE, label: '暴力' },
            { value: REPORT_TYPE.ILLEGAL, label: '违法' },
            { value: REPORT_TYPE.ADVERTISING, label: '广告' },
            { value: REPORT_TYPE.OTHER, label: '其他' }
        ]

        ctx.body = new SuccessModel({ reportTypeList })
    } catch (error) {
        console.error('getReportTypeListCtrl error:', error)
        ctx.body = new ErrorModel({ errno: -1, message: '获取举报类型列表失败' })
    }
}

module.exports = {
    createReportCtrl,
    getReportRecordsCtrl,
    getReportTypeListCtrl
}