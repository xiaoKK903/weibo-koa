/**
 * @description 私信页面路由
 * @author milk
 */

const router = require("koa-router")();
const { loginRedirect } = require("../../middlewares/loginChecks");
const { 
    getConversationList, 
    getTotalUnreadCount,
    getMessageList,
    markMessagesAsRead
} = require("../../services/message");
const { getUnreadAtCount } = require("../../services/at");
const { getUserInfo } = require("../../services/user");

router.prefix("/message");

router.get("/", loginRedirect, async (ctx, next) => {
    const userInfo = ctx.session.userInfo;
    const userId = userInfo.id;
    
    const unreadAtCount = await getUnreadAtCount(userId);
    const unreadMessageCount = await getTotalUnreadCount(userId);
    const conversations = await getConversationList(userId);
    
    await ctx.render("messages", {
        isLogin: true,
        isNav: true,
        unreadAtCount,
        unreadMessageCount,
        currentUserId: userId,
        userData: {
            userInfo,
            fansData: {
                count: 0,
                list: [],
            },
            followersData: {
                count: 0,
                list: [],
            },
        },
        conversationData: {
            isEmpty: conversations.length === 0,
            conversations,
        },
    });
});

router.get("/:userName", loginRedirect, async (ctx, next) => {
    const userInfo = ctx.session.userInfo;
    const userId = userInfo.id;
    const { userName } = ctx.params;
    
    const targetUserInfo = await getUserInfo(userName);
    if (!targetUserInfo) {
        ctx.redirect("/message");
        return;
    }
    
    const targetUserId = targetUserInfo.id;
    
    if (userId === targetUserId) {
        ctx.redirect("/message");
        return;
    }
    
    const unreadAtCount = await getUnreadAtCount(userId);
    const unreadMessageCount = await getTotalUnreadCount(userId);
    const conversations = await getConversationList(userId);
    
    await markMessagesAsRead(userId, targetUserId);
    
    const messageResult = await getMessageList(userId, targetUserId, 0, 50);
    
    await ctx.render("message-detail", {
        isLogin: true,
        isNav: true,
        unreadAtCount,
        unreadMessageCount,
        currentUserId: userId,
        userData: {
            userInfo,
            fansData: {
                count: 0,
                list: [],
            },
            followersData: {
                count: 0,
                list: [],
            },
        },
        conversationData: {
            isEmpty: conversations.length === 0,
            conversations,
        },
        targetUser: {
            id: targetUserId,
            userName: targetUserInfo.userName,
            nickName: targetUserInfo.nickName || targetUserInfo.userName,
            picture: targetUserInfo.picture,
        },
        messageData: {
            count: messageResult.count,
            messages: messageResult.messages,
            isEmpty: messageResult.messages.length === 0,
        },
    });
});

module.exports = router;
