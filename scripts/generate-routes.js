/**
 * @name 生成 Ant Design Pro 路由配置
 * @desc 从数据库读取菜单数据，生成简化版 routes.ts
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// 读取 .env 配置
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'project',
};

const outputDir = process.env.OUTPUT_DIR || path.join(__dirname, '../config');

/**
 * 将路径转换为组件路径
 * /dashboard/analysis -> ./dashboard/analysis
 */
function pathToComponent(p) {
  return `.${p}`;
}

/**
 * 构建路由树
 */
function buildRouteTree(menus) {
  const map = {};
  const roots = [];

  // 第一遍：创建所有节点
  for (const menu of menus) {
    const { path, name, displayName, icon } = menu;
    const segments = path.split('/').filter(Boolean);
    const level = segments.length - 1;
    const isLeaf = segments.length > 1;

    map[path] = {
      path,
      name: name,
      displayName: displayName,
      icon: icon || 'smile',
      component: isLeaf ? pathToComponent(path) : '',
      redirect: '',
      children: [],
    };
  }

  // 第二遍：建立父子关系
  for (const menu of menus) {
    const { path } = menu;
    const segments = path.split('/').filter(Boolean);
    const level = segments.length - 1;

    if (level > 0) {
      segments.pop();
      const parentPath = '/' + segments.join('/');

      if (map[parentPath]) {
        map[parentPath].children.push(map[path]);
      }
    }
  }

  // 第三遍：收集根节点
  for (const menu of menus) {
    const { path } = menu;
    const segments = path.split('/').filter(Boolean);
    const level = segments.length - 1;

    if (level === 0) {
      roots.push(map[path]);
    }
  }

  return roots;
}

/**
 * 转换节点格式（移除空 children）
 */
function convertNode(node) {
  // name 已经是英文的，直接使用
  const result = {
    path: node.path,
    name: node.name,
    displayName: node.displayName,
    icon: node.icon,
  };

  // 如果 component 为空（一级菜单），不输出 component
  if (node.component) {
    result.component = node.component;
  }

  if (node.redirect) {
    result.redirect = node.redirect;
  }

  if (node.children && node.children.length > 0) {
    result.routes = node.children.map(convertNode);
  }

  return result;
}

/**
 * 生成路由文件内容
 */
function generateRoutesCode(routes) {
  // 将路由对象转换为 TypeScript 格式的字符串
  function toTsCode(obj, indent = 2) {
    const spaces = ' '.repeat(indent);
    if (Array.isArray(obj)) {
      if (obj.length === 0) return '[]';
      const items = obj.map(item => spaces + toTsCode(item, indent + 2)).join(',\n');
      return `[\n${items}\n${spaces}]`;
    }
    if (typeof obj === 'object' && obj !== null) {
      const items = Object.entries(obj)
        .map(([key, value]) => {
          if (value === undefined || (Array.isArray(value) && value.length === 0)) {
            return null;
          }
          const formattedValue = typeof value === 'string' ? `'${value}'` : toTsCode(value, indent + 2);
          return `${spaces}${key}: ${formattedValue}`;
        })
        .filter(Boolean)
        .join(',\n');
      return `{\n${items}\n${spaces.slice(2)}}`;
    }
    if (typeof obj === 'string') return `'${obj}'`;
    return String(obj);
  }

  const routesTs = toTsCode(routes);

  // 将路由数组展开为多个对象
  const expandedRoutes = routes.map(r => toTsCode(r, 2)).join(',\n  ');

  return `/**
 * @name 自动生成的路由配置
 * @desc 由 scripts/generate-routes.js 从数据库自动生成
 * @desc 请勿手动修改，此文件会被覆盖
 */

export default [
  // 用户相关页面（不通过数据库管理）
  {
    path: '/user',
    layout: false,
    routes: [
      {
        path: '/user/login',
        layout: false,
        name: 'login',
        component: './user/login',
      },
      {
        path: '/user',
        redirect: '/user/login',
      },
      {
        name: 'register-result',
        icon: 'smile',
        path: '/user/register-result',
        component: './user/register-result',
      },
      {
        name: 'register',
        icon: 'smile',
        path: '/user/register',
        component: './user/register',
      },
      {
        component: '404',
        path: '/user/*',
      },
    ],
  },
  // 从数据库生成的菜单路由
  ${expandedRoutes},
  // 默认重定向
  {
    path: '/',
    redirect: '/dashboard/analysis',
  },
  // 404 页面
  {
    component: '404',
    path: '/*',
  },
];
`;
}

/**
 * 主函数
 */
async function main() {
  let connection;

  try {
    console.log('🚀 开始生成路由配置...');
    console.log(`📦 数据库: ${dbConfig.database}@${dbConfig.host}:${dbConfig.port}`);

    // 连接数据库
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');

    // 查询菜单数据
    const [rows] = await connection.execute(`
      SELECT path, name, title, icon, sort
      FROM system_menu
      WHERE status = 1 AND is_visible = 1
      ORDER BY sort ASC, path ASC
    `);

    console.log(`📋 查询到 ${rows.length} 条菜单记录`);

    if (rows.length === 0) {
      console.warn('⚠️  没有找到菜单数据');
      return;
    }

    // 预处理：优先使用 title，否则使用 name
    const menus = rows.map(row => ({
      ...row,
      displayName: row.title || row.name,
    }));

    // 构建路由树
    const routeTree = buildRouteTree(menus);
    console.log(`🌳 构建了 ${routeTree.length} 个根路由`);

    // 转换格式
    const routes = routeTree.map(convertNode);

    // 生成代码
    const code = generateRoutesCode(routes);

    // 确保输出目录存在
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // 写入文件
    const outputPath = path.join(outputDir, 'routes.ts');
    fs.writeFileSync(outputPath, code, 'utf8');

    console.log(`✅ 路由文件已生成: ${outputPath}`);
    console.log(`📄 文件大小: ${(code.length / 1024).toFixed(2)} KB`);

  } catch (error) {
    console.error('❌ 生成失败:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

main();
