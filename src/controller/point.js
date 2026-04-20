/**
 * @description 积分控制器
 * @author milk
 */

const { SuccessModel, ErrorModel } = require('../model/ResModel');
const {
    getUserLevelInfo,
    getDailyPointStats,
    getPointHistory
} = require('../services/point');

async function getCurrentUserLevelInfo(ctx) {
    try {
        console.log('=== getCurrentUserLevelInfo ===');
        
        if (!ctx.session || !ctx.session.userInfo) {
            return new ErrorModel({ errno: 401, message: '未登录' });
        }

        const userId = ctx.session.userInfo.id;
        const levelInfo = await getUserLevelInfo(userId);

        return new SuccessModel(levelInfo);
    } catch (error) {
        console.error('CRITICAL_ERROR_TRACE: getCurrentUserLevelInfo error');
        console.error('Error:', error);
        return new ErrorModel({ errno: 500, message: '获取用户等级信息失败' });
    }
}

async function getUserLevelInfoByUserId(ctx) {
    try {
        console.log('=== getUserLevelInfoByUserId ===');
        
        const { userId } = ctx.params;
        
        if (!userId) {
            return new ErrorModel({ errno: 400, message: '缺少用户ID' });
        }

        const levelInfo = await getUserLevelInfo(parseInt(userId));

        return new SuccessModel(levelInfo);
    } catch (error) {
        console.error('CRITICAL_ERROR_TRACE: getUserLevelInfoByUserId error');
        console.error('Error:', error);
        return new ErrorModel({ errno: 500, message: '获取用户等级信息失败' });
    }
}

async function getDailyStats(ctx) {
    try {
        console.log('=== getDailyStats ===');
        
        if (!ctx.session || !ctx.session.userInfo) {
            return new ErrorModel({ errno: 401, message: '未登录' });
        }

        const userId = ctx.session.userInfo.id;
        const stats = await getDailyPointStats(userId);

        return new SuccessModel(stats);
    } catch (error) {
        console.error('CRITICAL_ERROR_TRACE: getDailyStats error');
        console.error('Error:', error);
        return new ErrorModel({ errno: 500, message: '获取每日积分统计失败' });
    }
}

async function getHistory(ctx) {
    try {
        console.log('=== getHistory ===');
        
        if (!ctx.session || !ctx.session.userInfo) {
            return new ErrorModel({ errno: 401, message: '未登录' });
        }

        const userId = ctx.session.userInfo.id;
        const { pageIndex = 0, pageSize = 20 } = ctx.query;
        
        const history = await getPointHistory(
            userId,
            parseInt(pageIndex),
            parseInt(pageSize)
        );

        return new SuccessModel(history);
    } catch (error) {
        console.error('CRITICAL_ERROR_TRACE: getHistory error');
        console.error('Error:', error);
        return new ErrorModel({ errno: 500, message: '获取积分历史失败' });
    }
}

module.exports = {
    getCurrentUserLevelInfo,
    getUserLevelInfoByUserId,
    getDailyStats,
    getHistory
};