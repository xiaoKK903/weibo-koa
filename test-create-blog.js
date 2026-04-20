/**
 * @description 测试创建微博功能
 * @author milk
 */

const { create } = require('./src/controller/blog-home');

async function testCreateBlog() {
    try {
        console.log('=== 测试创建微博 ===');
        
        const result = await create({
            userId: 1, // 测试用户的 ID
            content: '这是一条测试微博，测试创建微博功能是否正常。',
            image: '' // 空图片
        });
        
        console.log('创建微博结果:', result);
        
        if (result instanceof require('./src/model/ResModel').SuccessModel) {
            console.log('创建微博成功！');
        } else {
            console.log('创建微博失败:', result);
        }
        
        process.exit(0);
    } catch (error) {
        console.error('测试创建微博失败:', error);
        process.exit(1);
    }
}

testCreateBlog();