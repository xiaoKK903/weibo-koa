/**
 * @description 内容安全检查模块 - 敏感词过滤、重复内容拦截
 * @author milk
 */

const crypto = require('crypto');
const { SENSITIVE_WORDS } = require('../conf/sensitiveWords');
const { set: redisSet, get: redisGet } = require('../cache/_redis');
const { DUPLICATE_CHECK_INTERVAL } = require('../conf/constant');

/**
 * 规范化内容用于检测
 * 策略：去除HTML标签、去除HTML实体、去除所有空白字符、去除标点符号、统一小写
 * @param {string} content 原始内容
 * @returns {string} 规范化后的内容
 */
function normalizeContent(content) {
    if (!content || typeof content !== 'string') {
        return '';
    }

    let normalized = content;

    normalized = normalized.replace(/<[^>]+>/g, '');

    normalized = normalized
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");

    normalized = normalized.replace(/\s+/g, '');

    normalized = normalized.replace(/[，。！？、；：""''（）【】《》…—,.!?;:"'()\[\]<>\\\-_=+`~@#$%^&*|\\\/]+/g, '');

    normalized = normalized.toLowerCase();

    return normalized;
}

/**
 * 检查内容是否包含敏感词
 * @param {string} content 待检查的内容
 * @returns {Object} { hasSensitive: boolean, sensitiveWords: string[], normalizedContent: string }
 */
function checkSensitiveWords(content) {
    if (!content || typeof content !== 'string') {
        return { 
            hasSensitive: false, 
            sensitiveWords: [], 
            normalizedContent: '' 
        };
    }

    const normalizedContent = normalizeContent(content);

    if (!normalizedContent) {
        return { 
            hasSensitive: false, 
            sensitiveWords: [], 
            normalizedContent: '' 
        };
    }

    const foundSensitiveWords = [];

    for (const word of SENSITIVE_WORDS) {
        if (normalizedContent.includes(word.toLowerCase())) {
            if (!foundSensitiveWords.includes(word)) {
                foundSensitiveWords.push(word);
            }
        }
    }

    return {
        hasSensitive: foundSensitiveWords.length > 0,
        sensitiveWords: foundSensitiveWords,
        normalizedContent: normalizedContent
    };
}

/**
 * 生成Redis的唯一key
 * @param {number} userId 用户ID
 * @param {string} normalizedContent 规范化后的内容
 * @param {string} contentType 内容类型：'blog' | 'comment' | 'reply'
 * @param {number} [blogId] 微博ID
 * @param {number} [parentId] 父评论ID
 * @returns {string} redisKey
 */
function generateRedisKey(userId, normalizedContent, contentType, blogId = null, parentId = null) {
    const contentHash = normalizedContent 
        ? crypto.createHash('md5').update(normalizedContent).digest('hex')
        : 'empty_content';

    let keyParts = ['content', contentType, userId.toString()];

    if (contentType === 'comment' || contentType === 'reply') {
        if (blogId) {
            keyParts.push(blogId.toString());
        }
    }

    if (contentType === 'reply' && parentId) {
        keyParts.push(parentId.toString());
    }

    keyParts.push(contentHash);

    return keyParts.join(':');
}

/**
 * 检查是否是重复内容（仅检查，不设置缓存）
 * @param {number} userId 用户ID
 * @param {string} normalizedContent 规范化后的内容
 * @param {string} contentType 内容类型
 * @param {number} [blogId] 微博ID
 * @param {number} [parentId] 父评论ID
 * @returns {Promise<boolean>} 是否是重复内容
 */
async function checkDuplicateContent(userId, normalizedContent, contentType, blogId = null, parentId = null) {
    try {
        if (!normalizedContent) {
            return false;
        }

        const redisKey = generateRedisKey(userId, normalizedContent, contentType, blogId, parentId);

        const exists = await redisGet(redisKey);
        
        return exists !== null;
    } catch (ex) {
        console.error('[内容安全] 检查重复内容出错:', ex.message);
        return false;
    }
}

/**
 * 设置重复内容缓存（内容检查通过后才调用）
 * @param {number} userId 用户ID
 * @param {string} normalizedContent 规范化后的内容
 * @param {string} contentType 内容类型
 * @param {number} [blogId] 微博ID
 * @param {number} [parentId] 父评论ID
 * @returns {Promise<void>}
 */
async function setDuplicateCache(userId, normalizedContent, contentType, blogId = null, parentId = null) {
    try {
        if (!normalizedContent) {
            return;
        }

        const redisKey = generateRedisKey(userId, normalizedContent, contentType, blogId, parentId);

        await redisSet(redisKey, '1', DUPLICATE_CHECK_INTERVAL);
        
        console.log(`[内容安全] 设置重复内容缓存: ${redisKey}, 有效期: ${DUPLICATE_CHECK_INTERVAL}秒`);
    } catch (ex) {
        console.error('[内容安全] 设置重复缓存出错:', ex.message);
    }
}

/**
 * 内容安全检查（综合检查）
 * @param {number} userId 用户ID
 * @param {string} content 内容
 * @param {string} contentType 内容类型：'blog' | 'comment' | 'reply'
 * @param {number} [blogId] 微博ID
 * @param {number} [parentId] 父评论ID
 * @returns {Promise<Object>} { 
 *   pass: boolean, 
 *   errorType: 'duplicate' | 'sensitive' | null,
 *   errorMessage: string | null,
 *   sensitiveWords: string[],
 *   errno: number,
 *   normalizedContent: string  // 规范化后的内容，用于后续设置缓存
 * }
 */
async function contentSecurityCheck(userId, content, contentType, blogId = null, parentId = null) {
    try {
        console.log(`[内容安全] 开始检查 - 用户: ${userId}, 类型: ${contentType}, blogId: ${blogId}, parentId: ${parentId}`);
        console.log(`[内容安全] 原始内容: ${content ? content.substring(0, 100) + (content.length > 100 ? '...' : '') : '(空)'}`);

        const sensitiveResult = checkSensitiveWords(content);
        
        console.log(`[内容安全] 规范化内容: ${sensitiveResult.normalizedContent ? sensitiveResult.normalizedContent.substring(0, 100) : '(空)'}`);
        console.log(`[内容安全] 敏感词检查: ${sensitiveResult.hasSensitive ? '发现敏感词' : '通过'}, 敏感词: ${sensitiveResult.sensitiveWords.join(', ')}`);

        if (sensitiveResult.hasSensitive) {
            return {
                pass: false,
                errorType: 'sensitive',
                errorMessage: '您发布的内容包含违规词汇，请检查后重新发布',
                sensitiveWords: sensitiveResult.sensitiveWords,
                errno: 16002,
                normalizedContent: sensitiveResult.normalizedContent
            };
        }

        const isDuplicate = await checkDuplicateContent(
            userId, 
            sensitiveResult.normalizedContent, 
            contentType, 
            blogId, 
            parentId
        );
        
        console.log(`[内容安全] 重复内容检查: ${isDuplicate ? '发现重复' : '通过'}`);

        if (isDuplicate) {
            return {
                pass: false,
                errorType: 'duplicate',
                errorMessage: '请勿频繁发布相同或相似内容，请稍候再试',
                sensitiveWords: [],
                errno: 16001,
                normalizedContent: sensitiveResult.normalizedContent
            };
        }

        console.log(`[内容安全] 所有检查通过`);

        return {
            pass: true,
            errorType: null,
            errorMessage: null,
            sensitiveWords: [],
            errno: 0,
            normalizedContent: sensitiveResult.normalizedContent
        };
    } catch (ex) {
        console.error('[内容安全] 检查出错:', ex.message, ex.stack);
        return {
            pass: true,
            errorType: null,
            errorMessage: null,
            sensitiveWords: [],
            errno: 0,
            normalizedContent: ''
        };
    }
}

const CONTENT_TYPES = {
    BLOG: 'blog',
    COMMENT: 'comment',
    REPLY: 'reply'
};

module.exports = {
    checkSensitiveWords,
    checkDuplicateContent,
    contentSecurityCheck,
    setDuplicateCache,
    normalizeContent,
    generateRedisKey,
    CONTENT_TYPES
};
