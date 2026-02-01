# Ant Design Pro

This project is initialized with [Ant Design Pro](https://pro.ant.design). Follow is the quick guide for how to use.

## Database Setup

1. Copy `.env.example` to `.env`
2. Fill in your database credentials in `.env`:
   - `DB_USER`: 数据库用户名
   - `DB_PASSWORD`: 数据库密码
3. Import the SQL file to create tables:
   ```bash
   mysql -u用户名 -p密码 project < sql/project.sql
   ```

## Server Configuration

### PHP Configuration

Modify `php/index.php` line 31 to point to your local CodeIgniter framework:

```php
define('FRAMEWORKPATH', '/your/path/to/CodeIgniter');
```

**CodeIgniter Version:** 4.6.4

### Nginx Configuration

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

## Environment Prepare

Install `node_modules`:

```bash
npm install
```

or

```bash
yarn
```

## Provided Scripts

Ant Design Pro provides some useful script to help you quick start and build with web project, code style check and test.

Scripts provided in `package.json`. It's safe to modify or add additional script:

### Start project

```bash
npm start
```

### Build project

```bash
npm run build
```

### Check code style

```bash
npm run lint
```

You can also use script to auto fix some lint error:

```bash
npm run lint:fix
```

### Test code

```bash
npm test
```

## More

You can view full document on our [official website](https://pro.ant.design). And welcome any feedback in our [github](https://github.com/ant-design/ant-design-pro).
