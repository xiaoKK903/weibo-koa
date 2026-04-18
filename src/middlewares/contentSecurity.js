/**
 * @description 内容安全检查模块 - 敏感词过滤、重复内容拦截
 * @author milk
 */

const crypto = require('crypto');
const { SENSITIVE_WORDS } = require('../conf/sensitiveWords');
const { set: redisSet, get: redisGet } = require('../cache/_redis');
const { DUPLICATE_CHECK_INTERVAL } = require('../conf/constant');

/**
 * 检查内容是否包含敏感词
 * @param {string} content 待检查的内容
 * @returns {Object} { hasSensitive: boolean, sensitiveWords: string[] }
 */
function checkSensitiveWords(content) {
    if (!content || typeof content !== 'string') {
        return { hasSensitive: false, sensitiveWords: [] };
    }

    const foundSensitiveWords = [];
    const lowerContent = content.toLowerCase();

    for (const word of SENSITIVE_WORDS) {
        if (lowerContent.includes(word.toLowerCase())) {
            foundSensitiveWords.push(word);
        }
    }

    return {
        hasSensitive: foundSensitiveWords.length > 0,
        sensitiveWords: foundSensitiveWords
    };
}

/**
 * 生成内容的唯一标识（用于重复内容检查）
 * @param {number} userId 用户ID
 * @param {string} content 内容
 * @param {string} contentType 内容类型：'blog' | 'comment'
 * @param {number} [parentId] 父评论ID（楼中楼评论使用）
 * @returns {string} contentHash
 */
function generateContentHash(userId, content, contentType, parentId = null) {
    const contentToHash = `${userId}:${contentType}:${parentId || 0}:${content.trim()}`;
    return crypto.createHash('md5').update(contentToHash).digest('hex');
}

/**
 * 检查是否是重复内容
 * @param {number} userId 用户ID
 * @param {string} content 内容
 * @param {string} contentType 内容类型：'blog' | 'comment'
 * @param {number} [parentId] 父评论ID（楼中楼评论使用）
 * @returns {Promise<boolean>} 是否是重复内容
 */
async function checkDuplicateContent(userId, content, contentType, parentId = null) {
    if (!content || content.trim() === '') {
        return false;
    }

    const contentHash = generateContentHash(userId, content, contentType, parentId);
    const redisKey = `duplicate:${contentHash}`;

    const exists = await redisGet(redisKey);
    
    if (exists) {
        return true;
    }

    await redisSet(redisKey, '1', DUPLICATE_CHECK_INTERVAL);
    return false;
}

/**
 * 内容安全检查（综合检查）
 * @param {number} userId 用户ID
 * @param {string} content 内容
 * @param {string} contentType 内容类型：'blog' | 'comment'
 * @param {number} [parentId] 父评论ID（楼中楼评论使用）
 * @returns {Promise<Object>} { 
 *   pass: boolean, 
 *   errorType: 'duplicate' | 'sensitive' | null,
 *   errorMessage: string | null,
 *   sensitiveWords: string[]
 * }
 */
async function contentSecurityCheck(userId, content, contentType, parentId = null) {
    const sensitiveResult = checkSensitiveWords(content);
    
    if (sensitiveResult.hasSensitive) {
        return {
            pass: false,
            errorType: 'sensitive',
            errorMessage: '您发布的内容包含违规词汇，请检查后重新发布',
            sensitiveWords: sensitiveResult.sensitiveWords
        };
    }

    const isDuplicate = await checkDuplicateContent(userId, content, contentType, parentId);
    
    if (isDuplicate) {
        return {
            pass: false,
            errorType: 'duplicate',
            errorMessage: '请勿频繁发布相同内容，请稍候再试',
            sensitiveWords: []
        };
    }

    return {
        pass: true,
        errorType: null,
        errorMessage: null,
        sensitiveWords: []
    };
}

module.exports = {
    checkSensitiveWords,
    checkDuplicateContent,
    contentSecurityCheck,
    generateContentHash
};
