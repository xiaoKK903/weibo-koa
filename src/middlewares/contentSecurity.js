/**
 * @description 内容安全检查模块 - 敏感词过滤、重复内容拦截
 * @author milk
 */

const crypto = require('crypto');
const { SENSITIVE_WORDS } = require('../conf/sensitiveWords');
const { set: redisSet, get: redisGet } = require('../cache/_redis');
const { DUPLICATE_CHECK_INTERVAL } = require('../conf/constant');

/**
 * 规范化内容用于重复内容检测
 * 策略：去除HTML标签、去除所有空白字符、去除标点符号、统一小写
 * @param {string} content 原始内容
 * @returns {string} 规范化后的内容
 */
function normalizeContent(content) {
    if (!content || typeof content !== 'string') {
        return '';
    }

    let normalized = content;

    // 1. 去除HTML标签（处理富文本）
    normalized = normalized.replace(/<[^>]+>/g, '');

    // 2. 解码HTML实体（如 &nbsp; -> 空格）
    normalized = normalized
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");

    // 3. 去除所有空白字符（空格、制表符、换行等）
    normalized = normalized.replace(/\s+/g, '');

    // 4. 去除常见标点符号
    normalized = normalized.replace(/[，。！？、；：""''（）【】《》…—,.!?;:"'()\[\]<>\\\-_=+`~@#$%^&*|\\\/]+/g, '');

    // 5. 统一转为小写
    normalized = normalized.toLowerCase();

    return normalized;
}

/**
 * 检查内容是否包含敏感词
 * @param {string} content 待检查的内容
 * @returns {Object} { hasSensitive: boolean, sensitiveWords: string[] }
 */
function checkSensitiveWords(content) {
    if (!content || typeof content !== 'string') {
        return { hasSensitive: false, sensitiveWords: [] };
    }

    // 去除HTML标签后再检查敏感词
    let contentToCheck = content.replace(/<[^>]+>/g, '');
    contentToCheck = contentToCheck.replace(/&nbsp;/g, ' ');

    const foundSensitiveWords = [];
    const lowerContent = contentToCheck.toLowerCase();

    for (const word of SENSITIVE_WORDS) {
        if (lowerContent.includes(word.toLowerCase())) {
            if (!foundSensitiveWords.includes(word)) {
                foundSensitiveWords.push(word);
            }
        }
    }

    return {
        hasSensitive: foundSensitiveWords.length > 0,
        sensitiveWords: foundSensitiveWords
    };
}

/**
 * 生成Redis的唯一key
 * 不同场景使用不同的key结构，避免缓存冲突
 * 
 * 微博: content:blog:{userId}:{contentHash}
 * 评论: content:comment:{userId}:{blogId}:{contentHash}
 * 楼中楼: content:reply:{userId}:{blogId}:{parentId}:{contentHash}
 * 
 * @param {number} userId 用户ID
 * @param {string} normalizedContent 规范化后的内容
 * @param {string} contentType 内容类型：'blog' | 'comment' | 'reply'
 * @param {number} [blogId] 微博ID（评论和楼中楼必需）
 * @param {number} [parentId] 父评论ID（楼中楼回复使用）
 * @returns {string} redisKey
 */
function generateRedisKey(userId, normalizedContent, contentType, blogId = null, parentId = null) {
    // 如果规范化后内容为空，使用一个特殊的空内容标识
    const contentHash = normalizedContent 
        ? crypto.createHash('md5').update(normalizedContent).digest('hex')
        : 'empty_content';

    let keyParts = ['content', contentType, userId.toString()];

    // 评论和楼中楼需要加上blogId
    if (contentType === 'comment' || contentType === 'reply') {
        if (blogId) {
            keyParts.push(blogId.toString());
        }
    }

    // 楼中楼需要加上parentId
    if (contentType === 'reply' && parentId) {
        keyParts.push(parentId.toString());
    }

    keyParts.push(contentHash);

    return keyParts.join(':');
}

/**
 * 检查是否是重复内容
 * @param {number} userId 用户ID
 * @param {string} content 原始内容
 * @param {string} contentType 内容类型：'blog' | 'comment' | 'reply'
 * @param {number} [blogId] 微博ID（评论和楼中楼必需）
 * @param {number} [parentId] 父评论ID（楼中楼回复使用）
 * @returns {Promise<boolean>} 是否是重复内容
 */
async function checkDuplicateContent(userId, content, contentType, blogId = null, parentId = null) {
    try {
        if (!content || content.trim() === '') {
            return false;
        }

        const normalizedContent = normalizeContent(content);
        
        // 空内容不做重复检查（避免所有空内容都被拦截）
        if (!normalizedContent) {
            return false;
        }

        const redisKey = generateRedisKey(userId, normalizedContent, contentType, blogId, parentId);

        const exists = await redisGet(redisKey);
        
        if (exists) {
            return true;
        }

        await redisSet(redisKey, '1', DUPLICATE_CHECK_INTERVAL);
        return false;
    } catch (ex) {
        console.error('检查重复内容出错:', ex.message);
        // Redis出错时不拦截，确保正常内容可以发布
        return false;
    }
}

/**
 * 内容安全检查（综合检查）
 * @param {number} userId 用户ID
 * @param {string} content 内容
 * @param {string} contentType 内容类型：'blog' | 'comment' | 'reply'
 * @param {number} [blogId] 微博ID（评论和楼中楼必需）
 * @param {number} [parentId] 父评论ID（楼中楼回复使用）
 * @returns {Promise<Object>} { 
 *   pass: boolean, 
 *   errorType: 'duplicate' | 'sensitive' | null,
 *   errorMessage: string | null,
 *   sensitiveWords: string[],
 *   errno: number  // 用于和现有ErrorInfo对应
 * }
 */
async function contentSecurityCheck(userId, content, contentType, blogId = null, parentId = null) {
    try {
        // 1. 先检查敏感词
        const sensitiveResult = checkSensitiveWords(content);
        
        if (sensitiveResult.hasSensitive) {
            return {
                pass: false,
                errorType: 'sensitive',
                errorMessage: '您发布的内容包含违规词汇，请检查后重新发布',
                sensitiveWords: sensitiveResult.sensitiveWords,
                errno: 16002
            };
        }

        // 2. 再检查重复内容
        const isDuplicate = await checkDuplicateContent(
            userId, 
            content, 
            contentType, 
            blogId, 
            parentId
        );
        
        if (isDuplicate) {
            return {
                pass: false,
                errorType: 'duplicate',
                errorMessage: '请勿频繁发布相同或相似内容，请稍候再试',
                sensitiveWords: [],
                errno: 16001
            };
        }

        // 3. 所有检查通过
        return {
            pass: true,
            errorType: null,
            errorMessage: null,
            sensitiveWords: [],
            errno: 0
        };
    } catch (ex) {
        console.error('内容安全检查出错:', ex.message, ex.stack);
        // 检查出错时不拦截，确保正常内容可以发布
        return {
            pass: true,
            errorType: null,
            errorMessage: null,
            sensitiveWords: [],
            errno: 0
        };
    }
}

/**
 * 判断内容类型（用于辅助理解）
 * - blog: 微博发布
 * - comment: 一级评论（直接对微博评论）
 * - reply: 楼中楼回复（对评论的回复）
 */
const CONTENT_TYPES = {
    BLOG: 'blog',
    COMMENT: 'comment',
    REPLY: 'reply'
};

module.exports = {
    checkSensitiveWords,
    checkDuplicateContent,
    contentSecurityCheck,
    normalizeContent,
    generateRedisKey,
    CONTENT_TYPES
};
