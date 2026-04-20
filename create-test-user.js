/**
 * @description 创建测试用户
 * @author milk
 */

const { User } = require('./src/db/model/index');
const doCrypto = require('./src/utils/cryp');

async function createTestUser() {
    try {
        console.log('=== 创建测试用户 ===');
        
        const user = await User.create({
            userName: 'zhangsan',
            password: doCrypto('123456'),
            nickName: '张三',
            gender: 1
        });
        
        console.log('测试用户创建成功:', user.dataValues);
        console.log('用户名: zhangsan');
        console.log('密码: 123456');
        
        process.exit(0);
    } catch (error) {
        console.error('创建测试用户失败:', error);
        process.exit(1);
    }
}

createTestUser();