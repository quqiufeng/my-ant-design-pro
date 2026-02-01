# Ant Design Pro / Ant Design Pro 项目

This project is initialized with [Ant Design Pro](https://pro.ant.design). Follow is the quick guide for how to use.
本项目基于 [Ant Design Pro](https://pro.ant.design) 初始化，以下是快速使用指南。

---

## About / 关于本项目

### EN

**All code in this project is developed using OpenCode with the MiniMax 2.1 LLM.**

本项目中所有代码均由 OpenCode 使用 MiniMax 2.1 大模型开发。

---

## Database Setup / 数据库设置

### EN

1. Copy `.env.example` to `.env`
2. Fill in your database credentials in `.env`:
   - `DB_USER`: Database username
   - `DB_PASSWORD`: Database password
3. Import the SQL file to create tables:
   ```bash
   mysql -uUsername -pPassword project < sql/project.sql
   ```

### ZH

1. 复制 `.env.example` 为 `.env`
2. 在 `.env` 中填写数据库配置：
   - `DB_USER`: 数据库用户名
   - `DB_PASSWORD`: 数据库密码
3. 导入 SQL 文件创建数据表：
   ```bash
   mysql -u用户名 -p密码 project < sql/project.sql
   ```

---

## Server Configuration / 服务器配置

### PHP Configuration / PHP 配置

#### EN

Modify `php/index.php` line 31 to point to your local CodeIgniter framework:

```php
define('FRAMEWORKPATH', '/your/path/to/CodeIgniter');
```

**CodeIgniter Version:** 4.6.4

**Database Configuration:**
The PHP backend reads database settings from the `.env` file:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=project
```

The configuration is loaded in `php/Config/Database.php` from environment variables.

#### ZH

修改 `php/index.php` 第31行，指向你本地的 CodeIgniter 框架目录：

```php
define('FRAMEWORKPATH', '/你的 CodeIgniter 路径');
```

**CodeIgniter 版本:** 4.6.4

**数据库配置：**
PHP 后端从 `.env` 文件读取数据库配置：

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=你的密码
DB_NAME=project
```

配置文件位于 `php/Config/Database.php`，从环境变量读取配置。

---

### Nginx Configuration / Nginx 配置

#### EN

Modify `conf/nginx/myapp.conf` line 5 to set the web root directory:

```nginx
root /path/to/my-ant-design-pro/php;
```

Also update log paths (lines 8-9):

```nginx
access_log /path/to/my-ant-design-pro/php/access.log;
error_log /path/to/my-ant-design-pro/php/error.log;
```

**PHP Version Required:** 8.1+ (Tested with 8.5.2)

#### ZH

修改 `conf/nginx/myapp.conf` 第5行，设置 web 根目录：

```nginx
root /你的路径/my-ant-design-pro/php;
```

同时更新日志路径（第8-9行）：

```nginx
access_log /你的路径/my-ant-design-pro/php/access.log;
error_log /你的路径/my-ant-design-pro/php/error.log;
```

**PHP 版本要求:** 8.1+ (已测试 8.5.2)

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

#### Generate CRUD Code

Generate Ant Design Pro table pages with backend API from database schema:

```bash
node scripts/generate-crud.js
```

This script generates:
- Frontend: ProTable page, search form, create/update forms
- Backend: CodeIgniter controller with CRUD API

**Configuration:** Edit `scripts/admin.json` or create your own config file.

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

#### 生成 CRUD 代码

根据数据库表结构自动生成 Ant Design Pro 表格页面和后端 API：

```bash
node scripts/generate-crud.js
```

此脚本会生成：
- 前端：ProTable 表格页面、搜索表单、新建/编辑表单
- 后端：CodeIgniter 控制器，包含完整的 CRUD API

**配置方式：** 编辑 `scripts/admin.json` 或创建你自己的配置文件。

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
test hook
