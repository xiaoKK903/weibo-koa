/**
 * @description 积分服务层
 * @author milk
 */

const { UserLevel, PointLog } = require('../db/model/index');
const {
    ACTION_TYPES,
    getLevelConfig,
    getDailyLimit,
    getExpPerAction,
    getExpProgress
} = require('../conf/pointRules');
const { Op } = require('sequelize');

function getTodayString() {
    const today = new Date();
    return today.toISOString().split('T')[0];
}

function isSameDay(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return d1.toISOString().split('T')[0] === d2.toISOString().split('T')[0];
}

async function getOrCreateUserLevel(userId) {
    let userLevel = await UserLevel.findOne({
        where: { userId }
    });

    if (!userLevel) {
        userLevel = await UserLevel.create({
            userId,
            level: 1,
            totalExp: 0,
            dailyLoginCount: 0,
            lastLoginDate: null
        });
    }

    return userLevel;
}

async function getUserLevelInfo(userId) {
    const userLevel = await getOrCreateUserLevel(userId);
    const levelConfig = getLevelConfig(userLevel.totalExp);
    const progress = getExpProgress(userLevel.totalExp);

    return {
        ...userLevel.dataValues,
        levelName: levelConfig.name,
        badgeColor: levelConfig.badgeColor,
        progress: progress,
        minExp: levelConfig.minExp,
        maxExp: levelConfig.maxExp
    };
}

async function addPoint(userId, actionType, actionId = null, description = null) {
    try {
        console.log(`[积分服务] 添加积分 - 用户: ${userId}, 行为: ${actionType}, actionId: ${actionId}`);

        const expPerAction = getExpPerAction(actionType);
        const dailyLimit = getDailyLimit(actionType);

        if (expPerAction <= 0) {
            console.log(`[积分服务] 行为 ${actionType} 没有积分配置`);
            return { success: false, message: '该行为无积分配置' };
        }

        const userLevel = await getOrCreateUserLevel(userId);
        const today = getTodayString();

        console.log(`[积分服务] 当前用户等级: ${userLevel.level}, 总经验: ${userLevel.totalExp}`);
        console.log(`[积分服务] 每次获得经验: ${expPerAction}, 每日上限: ${dailyLimit}`);

        let dailyCount = 0;
        let existingLog = null;

        if (actionId) {
            existingLog = await PointLog.findOne({
                where: {
                    userId,
                    actionType,
                    actionId,
                    actionDate: {
                        [Op.gte]: new Date(today + ' 00:00:00'),
                        [Op.lte]: new Date(today + ' 23:59:59')
                    }
                }
            });

            if (existingLog) {
                console.log(`[积分服务] 今日已获得该行为积分，跳过`);
                return { success: false, message: '今日已获得该行为积分' };
            }
        }

        const todayLogs = await PointLog.findAll({
            where: {
                userId,
                actionType,
                actionDate: {
                    [Op.gte]: new Date(today + ' 00:00:00'),
                    [Op.lte]: new Date(today + ' 23:59:59')
                }
            }
        });

        dailyCount = todayLogs.reduce((sum, log) => sum + log.actionCount, 0);
        console.log(`[积分服务] 今日已获得 ${actionType} 行为 ${dailyCount} 次积分`);

        if (dailyCount * expPerAction >= dailyLimit) {
            console.log(`[积分服务] 已达到每日积分上限`);
            return { success: false, message: '已达到每日积分上限' };
        }

        await PointLog.create({
            userId,
            actionType,
            actionId,
            exp: expPerAction,
            description: description || getDefaultDescription(actionType),
            actionDate: new Date(),
            actionCount: 1
        });

        userLevel.totalExp += expPerAction;

        const currentLevelConfig = getLevelConfig(userLevel.totalExp);
        if (currentLevelConfig.level > userLevel.level) {
            console.log(`[积分服务] 等级提升: ${userLevel.level} -> ${currentLevelConfig.level}`);
            userLevel.level = currentLevelConfig.level;
        }

        if (actionType === ACTION_TYPES.LOGIN) {
            if (!userLevel.lastLoginDate || !isSameDay(userLevel.lastLoginDate, new Date())) {
                userLevel.dailyLoginCount = 1;
            } else {
                userLevel.dailyLoginCount += 1;
            }
            userLevel.lastLoginDate = new Date();
        }

        await userLevel.save();

        console.log(`[积分服务] 添加积分成功，总经验: ${userLevel.totalExp}, 等级: ${userLevel.level}`);

        return {
            success: true,
            exp: expPerAction,
            totalExp: userLevel.totalExp,
            level: userLevel.level,
            levelUp: currentLevelConfig.level > userLevel.level - (expPerAction > 0 ? 1 : 0)
        };
    } catch (error) {
        console.error('[积分服务] 添加积分失败:', error.message, error.stack);
        return { success: false, message: error.message };
    }
}

function getDefaultDescription(actionType) {
    const descriptions = {
        [ACTION_TYPES.LOGIN]: '每日登录',
        [ACTION_TYPES.BLOG]: '发布微博',
        [ACTION_TYPES.COMMENT]: '发表评论',
        [ACTION_TYPES.LIKE]: '点赞',
        [ACTION_TYPES.COLLECT]: '收藏',
        [ACTION_TYPES.FOLLOW]: '关注用户',
        [ACTION_TYPES.AT]: '@好友',
        [ACTION_TYPES.SHARE]: '分享微博'
    };
    return descriptions[actionType] || '获得经验';
}

async function getDailyPointStats(userId) {
    const today = getTodayString();

    const stats = {};

    for (const actionType of Object.values(ACTION_TYPES)) {
        const logs = await PointLog.findAll({
            where: {
                userId,
                actionType,
                actionDate: {
                    [Op.gte]: new Date(today + ' 00:00:00'),
                    [Op.lte]: new Date(today + ' 23:59:59')
                }
            }
        });

        const totalExp = logs.reduce((sum, log) => sum + log.exp, 0);
        const count = logs.reduce((sum, log) => sum + log.actionCount, 0);

        stats[actionType] = {
            totalExp,
            count,
            dailyLimit: getDailyLimit(actionType),
            expPerAction: getExpPerAction(actionType),
            remainingExp: getDailyLimit(actionType) - totalExp
        };
    }

    return stats;
}

async function getPointHistory(userId, pageIndex = 0, pageSize = 20) {
    const result = await PointLog.findAndCountAll({
        where: { userId },
        order: [['createdAt', 'desc']],
        limit: pageSize,
        offset: pageSize * pageIndex
    });

    return {
        count: result.count,
        list: result.rows.map(row => row.dataValues),
        pageIndex,
        pageSize
    };
}

module.exports = {
    getOrCreateUserLevel,
    getUserLevelInfo,
    addPoint,
    getDailyPointStats,
    getPointHistory
};