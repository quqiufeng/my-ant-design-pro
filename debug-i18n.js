const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();

function toKebabCase(str) {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').replace(/\s+/g, '-').toLowerCase();
}

const connection = await mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_NAME || 'project'
});

const [menus] = await connection.execute(
  'SELECT name, title, path FROM system_menu WHERE path LIKE "/account%" ORDER BY sort'
);

console.log('Account menu records:');
menus.forEach(menu => {
  const baseKey = toKebabCase(menu.name);
  const pathParts = menu.path.split('/').filter(Boolean);
  let key = `menu.${baseKey}`;
  if (pathParts.length === 2) {
    key = `menu.${pathParts[0]}.${baseKey}`;
  }
  console.log(`  ${menu.path} -> name=${menu.name} -> key=${key}`);
});

await connection.end();
