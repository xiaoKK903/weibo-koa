/**
 * @description 积分规则配置
 * @author milk
 */

const ACTION_TYPES = {
    LOGIN: 'login',
    BLOG: 'blog',
    COMMENT: 'comment',
    LIKE: 'like',
    COLLECT: 'collect',
    FOLLOW: 'follow',
    AT: 'at',
    SHARE: 'share'
};

const LEVEL_CONFIG = [
    { level: 1, minExp: 0, maxExp: 99, name: '初入江湖', badgeColor: '#808080' },
    { level: 2, minExp: 100, maxExp: 299, name: '小有名气', badgeColor: '#20B2AA' },
    { level: 3, minExp: 300, maxExp: 599, name: '渐入佳境', badgeColor: '#4169E1' },
    { level: 4, minExp: 600, maxExp: 999, name: '炉火纯青', badgeColor: '#9370DB' },
    { level: 5, minExp: 1000, maxExp: 1499, name: '登峰造极', badgeColor: '#FF69B4' },
    { level: 6, minExp: 1500, maxExp: 2099, name: '一代宗师', badgeColor: '#FF8C00' },
    { level: 7, minExp: 2100, maxExp: 2799, name: '绝世高手', badgeColor: '#DC143C' },
    { level: 8, minExp: 2800, maxExp: 3599, name: '传奇人物', badgeColor: '#8B008B' },
    { level: 9, minExp: 3600, maxExp: 4499, name: '神话传说', badgeColor: '#FFD700' },
    { level: 10, minExp: 4500, maxExp: Infinity, name: '至尊无敌', badgeColor: '#FF4500' }
];

const POINT_RULES = {
    [ACTION_TYPES.LOGIN]: {
        exp: 5,
        dailyLimit: 5,
        description: '每日登录'
    },
    [ACTION_TYPES.BLOG]: {
        exp: 10,
        dailyLimit: 50,
        description: '发布微博'
    },
    [ACTION_TYPES.COMMENT]: {
        exp: 5,
        dailyLimit: 30,
        description: '发表评论'
    },
    [ACTION_TYPES.LIKE]: {
        exp: 2,
        dailyLimit: 20,
        description: '点赞'
    },
    [ACTION_TYPES.COLLECT]: {
        exp: 3,
        dailyLimit: 15,
        description: '收藏'
    },
    [ACTION_TYPES.FOLLOW]: {
        exp: 3,
        dailyLimit: 10,
        description: '关注用户'
    },
    [ACTION_TYPES.AT]: {
        exp: 2,
        dailyLimit: 10,
        description: '@好友'
    },
    [ACTION_TYPES.SHARE]: {
        exp: 5,
        dailyLimit: 15,
        description: '分享微博'
    }
};

function getLevelConfig(totalExp) {
    for (const levelConfig of LEVEL_CONFIG) {
        if (totalExp >= levelConfig.minExp && totalExp <= levelConfig.maxExp) {
            return levelConfig;
        }
    }
    return LEVEL_CONFIG[0];
}

function getNextLevelExp(totalExp) {
    const currentLevel = getLevelConfig(totalExp);
    if (currentLevel.level >= LEVEL_CONFIG.length) {
        return 0;
    }
    return currentLevel.maxExp + 1 - totalExp;
}

function getExpProgress(totalExp) {
    const currentLevel = getLevelConfig(totalExp);
    if (currentLevel.maxExp === Infinity) {
        return 100;
    }
    const levelExp = totalExp - currentLevel.minExp;
    const levelTotalExp = currentLevel.maxExp - currentLevel.minExp;
    return Math.round((levelExp / levelTotalExp) * 100);
}

function getPointRule(actionType) {
    return POINT_RULES[actionType] || null;
}

function getDailyLimit(actionType) {
    const rule = getPointRule(actionType);
    return rule ? rule.dailyLimit : 0;
}

function getExpPerAction(actionType) {
    const rule = getPointRule(actionType);
    return rule ? rule.exp : 0;
}

module.exports = {
    ACTION_TYPES,
    LEVEL_CONFIG,
    POINT_RULES,
    getLevelConfig,
    getNextLevelExp,
    getExpProgress,
    getPointRule,
    getDailyLimit,
    getExpPerAction
};