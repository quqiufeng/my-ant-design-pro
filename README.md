# Ant Design Pro / Ant Design Pro 项目

This project is initialized with [Ant Design Pro](https://pro.ant.design). Follow is the quick guide for how to use.
本项目基于 [Ant Design Pro](https://pro.ant.design) 初始化，以下是快速使用指南。

---

## About / 关于本项目

### EN

**All code in this project is developed using OpenCode with the MiniMax 2.1 LLM.**

本项目中所有代码均由 OpenCode 使用 MiniMax 2.1 大模型开发。 没有手写代码！！！

<img width="2560" height="1251" alt="image" src="https://github.com/user-attachments/assets/62092953-4224-47b2-a294-0df5651c8cd6" />

---

## Backend / 后端

### EN

This project uses **OpenResty (Nginx + Lua)** for the backend API. No PHP required.

**API Server:** `api.test.cn` (port 80)
- Lua scripts location: `/data/lua/web/`
- OpenResty location: `/var/www/web/my-openresty/`

### ZH

本项目后端使用 **OpenResty (Nginx + Lua)** 实现，无需 PHP。

**API 服务器:** `api.test.cn` (端口 80)
- Lua 脚本位置: `/data/lua/web/`
- OpenResty 位置: `/var/www/web/my-openresty/`

---

## Environment Prepare / 环境准备

### EN

Install `node_modules`:

```bash
npm install
```

or / 或者

```bash
yarn
```

### ZH

安装依赖：

```bash
npm install
```

或者

```bash
yarn
```

---

## Provided Scripts / 可用脚本

### EN

Ant Design Pro provides some useful script to help you quick start and build with web project, code style check and test.

Scripts provided in `package.json`. It's safe to modify or add additional script:

#### Generate Routes from Database

Read menu data from database and generate `config/routes.ts`:

```bash
node scripts/generate-routes.js
```

**Requirements:**
- Configure database connection in `.env`
- Menu data stored in `system_menu` table

#### Start project

```bash
npm start
```

#### Build project

```bash
npm run build
```

#### Check code style

```bash
npm run lint
```

You can also use script to auto fix some lint error:

```bash
npm run lint:fix
```

#### Test code

```bash
npm test
```

### ZH

Ant Design Pro 提供了一些有用的脚本，帮助你快速启动、构建项目，检查代码风格和运行测试。

脚本定义在 `package.json` 中，可以安全地修改或添加自定义脚本：

#### 从数据库生成路由

从数据库读取菜单数据并生成 `config/routes.ts`：

```bash
node scripts/generate-routes.js
```

**前提条件：**
- 在 `.env` 中配置数据库连接
- 菜单数据存储在 `system_menu` 表中

#### 启动项目

```bash
npm start
```

#### 构建项目

```bash
npm run build
```

#### 检查代码风格

```bash
npm run lint
```

你也可以使用脚本自动修复部分 lint 错误：

```bash
npm run lint:fix
```

#### 运行测试

```bash
npm test
```

---

## More / 更多信息

### EN

You can view full document on our [official website](https://pro.ant.design). And welcome any feedback in our [github](https://github.com/ant-design/ant-design-pro).

### ZH

你可以在[官网](https://pro.ant.design)查看完整文档。也欢迎在 [GitHub](https://github.com/ant-design/ant-design-pro) 给我们反馈。

---

## Changelog / 更新日志

### 2024-02-04
- Removed PHP/CodeIgniter backend
- Migrated to OpenResty (Nginx + Lua) for API
- Deleted php/, sql/, sync-php.sh directories and files
- Updated nginx.conf to remove PHP-FPM configurations
test hook
