const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

function toKebabCase(str) {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').replace(/\s+/g, '-').toLowerCase();
}

function formatOutput(obj) {
  const entries = Object.entries(obj);
  const lines = ["export default {"];
  entries.forEach(([k, v]) => {
    lines.push(`  '${k}': '${v}',`);
  });
  lines.push("};");
  return lines.join("\n") + "\n";
}

const defaultTranslations = {
  'menu.welcome': '欢迎',
  'menu.more-blocks': '更多区块',
  'menu.home': '首页',
  'menu.admin.sub-page': '二级管理页',
  'menu.login': '登录',
  'menu.register': '注册',
  'menu.register-result': '注册结果',
  'menu.exception.not-permission': '403',
  'menu.exception.not-find': '404',
  'menu.exception.server-error': '500',
  'menu.exception.trigger': '触发错误',
  'menu.account.center': '个人中心',
  'menu.account.settings': '个人设置',
  'menu.account.trigger': '触发报错',
  'menu.account.logout': '退出登录',
  'menu.editor.flow': '流程编辑器',
  'menu.editor.mind': '脑图编辑器',
  'menu.editor.koni': '拓扑编辑器',
};

async function generateI18n() {
  dotenv.config({ path: path.join(__dirname, '../.env') });

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '123456',
    database: process.env.DB_NAME || 'project'
  });

  const [menus] = await connection.execute(
    'SELECT name, title, path FROM system_menu WHERE status = 1 AND is_visible = 1 ORDER BY sort'
  );

  await connection.end();

  const zhCNPath = path.join(__dirname, '../src/locales/zh-CN/menu.ts');
  const enUSPath = path.join(__dirname, '../src/locales/en-US/menu.ts');

  const zhCN = { ...defaultTranslations };
  const enUS = { ...defaultTranslations };

  // 构建 path -> name 映射
  const pathToName = {};
  menus.forEach(m => pathToName[m.path] = m.name);

  menus.forEach(menu => {
    const baseKey = toKebabCase(menu.name);
    const pathParts = menu.path.split('/').filter(Boolean);
    
    let key = `menu.${baseKey}`;
    
    // 二级菜单
    if (pathParts.length === 2) {
      key = `menu.${pathParts[0]}.${baseKey}`;
    }
    // 三级菜单：使用二级菜单的name字段
    else if (pathParts.length === 3) {
      const gpName = pathParts[0];
      const parentPath = '/' + pathParts.slice(0, 2).join('/');
      const parentName = pathToName[parentPath];
      const parentKey = toKebabCase(parentName);
      key = `menu.${gpName}.${parentKey}.${baseKey}`;
    }
    
    enUS[key] = menu.name;
    zhCN[key] = menu.title || menu.name;
  });

  fs.writeFileSync(enUSPath, formatOutput(enUS));
  fs.writeFileSync(zhCNPath, formatOutput(zhCN));

  console.log(`Generated ${menus.length} menu translations`);
  console.log(`Total: ${Object.keys(zhCN).length} entries`);
}

generateI18n().catch(err => {
  console.error('Failed to generate i18n:', err.message);
  process.exit(1);
});
