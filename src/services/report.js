/**
 * @description 举报服务
 * @author milk
 */

const { Report, Blog, Comment, User } = require('../db/model/index')
const { Op } = require('sequelize')

// 举报类型配置
const REPORT_TYPE = {
    PORNOGRAPHY: 1, // 色情
    VIOLENCE: 2,    // 暴力
    ILLEGAL: 3,     // 违法
    ADVERTISING: 4, // 广告
    OTHER: 5        // 其他
}

// 举报目标类型配置
const TARGET_TYPE = {
    BLOG: 1,    // 微博
    COMMENT: 2  // 评论
}

// 举报状态配置
const REPORT_STATUS = {
    PENDING: 0,    // 待处理
    PROCESSED: 1,  // 已处理
    INVALID: 2     // 无效
}

/**
 * 创建举报
 * @param {Object} param0 举报数据 { reporterId, reportedUserId, targetType, targetId, reportType, content }
 */
async function createReport({ reporterId, reportedUserId, targetType, targetId, reportType, content }) {
    // 检查是否已经举报过
    const existingReport = await Report.findOne({
        where: {
            reporterId,
            targetType,
            targetId
        }
    })

    if (existingReport) {
        return { success: false, message: '您已经举报过该内容' }
    }

    // 创建举报记录
    const result = await Report.create({
        reporterId,
        reportedUserId,
        targetType,
        targetId,
        reportType,
        content
    })

    // 检查是否需要触发风控限流隐藏
    const reportCount = await Report.count({
        where: {
            targetType,
            targetId,
            status: { [Op.in]: [REPORT_STATUS.PENDING, REPORT_STATUS.PROCESSED] }
        }
    })

    // 如果举报数达到阈值，触发风控限流隐藏
    if (reportCount >= 3) {
        // 暂时注释掉，等待数据库表结构更新
        /*
        if (targetType === TARGET_TYPE.BLOG) {
            await Blog.update(
                { isBlocked: 1 },
                { where: { id: targetId } }
            )
        } else if (targetType === TARGET_TYPE.COMMENT) {
            await Comment.update(
                { isBlocked: true },
                { where: { id: targetId } }
            )
        }
        */
    }

    return { success: true, reportId: result.id }
}

/**
 * 获取用户的举报记录
 * @param {number} userId 用户ID
 * @param {Object} param1 分页参数 { pageIndex, pageSize }
 */
async function getReportRecords(userId, { pageIndex = 0, pageSize = 10 }) {
    const result = await Report.findAndCountAll({
        limit: pageSize,
        offset: pageSize * pageIndex,
        order: [['createdAt', 'desc']],
        where: {
            reporterId: userId
        },
        include: [
            {
                model: User,
                as: 'reportedUser',
                attributes: ['userName', 'nickName', 'picture']
            },
            {
                model: Blog,
                as: 'targetBlog',
                attributes: ['content', 'image']
            },
            {
                model: Comment,
                as: 'targetComment',
                attributes: ['content']
            }
        ]
    })

    const reportList = result.rows.map(row => {
        const report = row.dataValues
        // 格式化举报类型
        report.reportTypeText = getReportTypeText(report.reportType)
        // 格式化目标类型
        report.targetTypeText = getTargetTypeText(report.targetType)
        // 格式化状态
        report.statusText = getStatusText(report.status)
        return report
    })

    return {
        count: result.count,
        reportList
    }
}

/**
 * 获取举报类型文本
 * @param {number} type 举报类型
 */
function getReportTypeText(type) {
    const typeMap = {
        [REPORT_TYPE.PORNOGRAPHY]: '色情',
        [REPORT_TYPE.VIOLENCE]: '暴力',
        [REPORT_TYPE.ILLEGAL]: '违法',
        [REPORT_TYPE.ADVERTISING]: '广告',
        [REPORT_TYPE.OTHER]: '其他'
    }
    return typeMap[type] || '未知'
}

/**
 * 获取目标类型文本
 * @param {number} type 目标类型
 */
function getTargetTypeText(type) {
    const typeMap = {
        [TARGET_TYPE.BLOG]: '微博',
        [TARGET_TYPE.COMMENT]: '评论'
    }
    return typeMap[type] || '未知'
}

/**
 * 获取状态文本
 * @param {number} status 状态
 */
function getStatusText(status) {
    const statusMap = {
        [REPORT_STATUS.PENDING]: '待处理',
        [REPORT_STATUS.PROCESSED]: '已处理',
        [REPORT_STATUS.INVALID]: '无效'
    }
    return statusMap[status] || '未知'
}

module.exports = {
    createReport,
    getReportRecords,
    REPORT_TYPE,
    TARGET_TYPE,
    REPORT_STATUS,
    getReportTypeText,
    getTargetTypeText,
    getStatusText
}