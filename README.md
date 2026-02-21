# Koa2 Weibo

一个基于 Koa2 的微博系统，采用现代化的 Node.js 技术栈构建。

## 作者

milk

## 技术栈

- **后端框架**: Koa2
- **数据库**: MySQL
- **缓存**: Redis
- **模板引擎**: EJS
- **ORM**: Sequelize
- **测试框架**: Jest

## 功能特性

- 用户注册/登录/注销
- 微博发布/查看/删除
- 个人资料管理
- 密码修改
- 会话管理
- 数据验证
- XSS 防护

## 环境要求

- Node.js >= 12.x
- MySQL >= 5.7
- Redis >= 4.0

## 快速开始

### 1. 克隆项目

```bash
git clone <your-repo-url>
cd koa2-weibo
```

### 2. 安装依赖

```bash
npm install
# 或者使用 yarn
yarn install
```

### 3. 配置数据库

创建 MySQL 数据库：

```sql
CREATE DATABASE koa2_weibo_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

修改配置文件 `/src/conf/db.js` 中的数据库连接信息：

```javascript
const MYSQL_CONF = {
  host: "localhost",
  user: "your_mysql_user",
  password: "your_mysql_password",
  port: "3306",
  database: "koa2_weibo_db",
};
```

修改 Redis 配置（如有需要）：

```javascript
const REDIS_CONF = {
  port: 6379,
  host: "127.0.0.1",
};
```

### 4. 创建数据库表

运行数据库同步脚本：

```bash
npm run sync-db
# 或者直接运行
node ./src/db/sync.js
```

### 5. 启动项目

#### 开发模式

```bash
npm run dev
# 或者
npm start
```

#### 生产模式

```bash
npm run prd
# 或者使用 PM2
pm2 start pm2.conf.json
```

### 6. 访问应用

启动完成后，访问 `http://localhost:8080` 即可使用应用。

## 项目结构

```
├── bin/                    # 启动脚本
├── src/                    # 源代码目录
│   ├── cache/              # Redis 缓存相关
│   ├── conf/               # 配置文件
│   ├── controller/         # 控制器层（业务逻辑）
│   ├── db/                 # 数据库模型定义
│   ├── middlewares/        # 中间件
│   ├── model/              # 数据模型（响应格式）
│   ├── public/             # 静态资源
│   ├── routes/             # 路由定义
│   ├── services/           # 服务层（数据操作）
│   ├── utils/              # 工具函数
│   ├── validator/          # 数据校验
│   ├── views/              # 视图模板
│   └── app.js              # 应用主入口
├── test/                   # 测试文件
├── .gitignore              # Git 忽略文件配置
├── .eslintrc.json          # ESLint 配置
├── package.json            # 项目配置
└── README.md               # 项目说明
```

## 命令说明

- `npm start`: 启动开发服务器（使用 nodemon 热重载）
- `npm run dev`: 同 `npm start`
- `npm run prd`: 使用 PM2 启动生产环境
- `npm test`: 运行单元测试
- `npm run lint`: 代码风格检查
- `npm run sync-db`: 同步数据库表结构

## 测试

运行所有测试：

```bash
npm test
```

运行指定测试文件：

```bash
npm test test/user/login.test.js
```

## 配置说明

### 环境变量

项目支持以下环境变量：

- `NODE_ENV`: 环境标识（development/production/test）
- `REDIS_HOST`: Redis 主机地址
- `REDIS_PORT`: Redis 端口
- `MYSQL_HOST`: MySQL 主机地址
- `MYSQL_PORT`: MySQL 端口
- `MYSQL_USER`: MySQL 用户名
- `MYSQL_PASSWORD`: MySQL 密码
- `MYSQL_DATABASE`: MySQL 数据库名

### 会话配置

会话密钥配置在 `/src/conf/secretKeys.js` 文件中：

```javascript
module.exports = {
  SESSION_SECRET_KEY: "your-session-secret-key", // 会话密钥
  PWD_SECRET_KEY: "your-password-secret-key",   // 密码加密密钥
};
```

## 部署

### 生产环境部署

1. 安装 PM2：

```bash
npm install -g pm2
```

2. 使用 PM2 启动应用：

```bash
pm2 start pm2.conf.json
```

3. 查看应用状态：

```bash
pm2 list
pm2 logs
```

## 贡献

欢迎提交 Issue 和 Pull Request 来帮助改进项目。

## 许可证

MIT