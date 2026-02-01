#!/usr/bin/env node

/**
 * 交互式 CRUD 代码生成器
 * 运行:
 *   - 交互模式: node generate-crud.js
 *   - 非交互模式: node generate-crud.js < config.json
 *   - 生成代码: cat config.json | node generate-crud.js --generate
 *
 * ============================================================
 * config.json 配置示例
 * ============================================================
 *
 * {
 *   "path": "/system/admin",              // 菜单路径（对应 system_menu.path）
 *   "table": "admin",                     // 数据库表名（必填）
 *
 *   // 搜索字段配置
 *   "search_field": [
 *     "id",                              // 字符串：普通输入框
 *     "username",                        // 自动从数据库注释获取 label
 *     "phone",
 *     {                                  // 对象：下拉选择框
 *       "field": "role_id",              // 字段名（数据库列名）
 *       "type": "select",                // 控件类型：input/select/password/textarea
 *       "api": "/api/role",              // 下拉框数据接口（type=select 时必填）
 *       "displayField": "name",          // 下拉框显示的字段（label 字段）
 *       "valueField": "id",              // 下拉框值的字段（value 字段）
 *       // "label": "角色"               // 可选，自动从数据库注释获取
 *     }
 *   ],
 *
 *   // 列表字段配置
 *   "list_field": [
 *     "id",                              // 普通字段直接写字段名
 *     "username",
 *     "phone",
 *     // LEFT JOIN 关联查询语法
 *     // "left join {关联表名} on {本表字段}={关联表字段} display {显示字段} as {别名}"
 *     "left join role on role_id=id display name as role_name"
 *   ],
 *
 *   // 新建表单字段配置
 *   "create_field": [
 *     "username",
 *     "password",                        // 自动识别为 password 类型
 *     "role_id"                          // 自动从 search_field 继承 select 配置
 *   ],
 *
 *   // 编辑表单字段配置
 *   "update_field": [
 *     "username",
 *     "phone"
 *   ]
 * }
 *
 * ============================================================
 * 字段类型说明
 * ============================================================
 *
 * type 可选值:
 *   - input      : 文本输入框（默认）
 *   - select     : 下拉选择框（需要 api 参数）
 *   - password   : 密码输入框（自动识别包含 password 的字段）
 *   - textarea   : 文本域（自动识别包含 desc/remark/content 的字段）
 *
 * 自动识别规则:
 *   - 包含 "password"    -> type: password
 *   - 包含 "desc/remark" -> type: textarea
 *   - 包含 "_id"         -> type: select
 *
 * 配置继承规则:
 *   - search_field 中定义的 select 类型配置，会自动继承到 create/update 字段
 *   - create_field 和 update_field 中只需写字段名字符串即可，如 "role_id"
 *   - 无需重复配置 select 的 api、displayField、valueField 等参数
 *
 * 示例:
 *   "search_field": [ { "field": "role_id", "type": "select", "api": "/api/role" } ],
 *   "create_field": [ "role_id" ]  // 自动继承为 select 类型
 *
 * ============================================================
 * LEFT JOIN 语法说明
 * ============================================================
 *
 * 格式: "left join {表名} on {本表字段}={关联表字段} display {显示字段} as {别名}"
 *
 * 示例: "left join role on role_id=id display name as role_name"
 *
 *   效果:
 *   - 后端: $builder->join('role', 'role.id = admin.role_id', 'left');
 *   - 后端: $builder->select('..., role.name as role_name');
 *   - 前端: columns 中生成 role_name 列
 *
 * ============================================================
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// 读取 .env 文件
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  const env = {};

  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf-8');
    content.split('\n').forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...values] = trimmed.split('=');
        if (key && values.length > 0) {
          env[key.trim()] = values.join('=').trim();
        }
      }
    });
  }

  return env;
}

const env = loadEnv();

// 数据库配置（从 .env 读取）
const dbConfig = {
  host: env.DB_HOST || 'localhost',
  port: parseInt(env.DB_PORT || '3306'),
  user: env.DB_USER || 'root',
  password: env.DB_PASSWORD || '',
  database: env.DB_NAME || 'project',
};

let isInteractive = process.stdin.isTTY;

// 检测是否为管道输入（非交互模式）
if (!isInteractive && !process.env.FORCE_INTERACTIVE) {
  // 非交互模式，从 stdin 读取配置
  runNonInteractive();
} else {
  // 交互模式
  isInteractive = true;
  rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true,
  });
  main();
}

// 非交互模式：从 JSON 文件读取配置
async function runNonInteractive() {
  let config;

  // 从 stdin 读取
  const chunks = [];
  process.stdin.on('data', (chunk) => chunks.push(chunk));
  process.stdin.on('end', async () => {
    try {
      const input = JSON.parse(chunks.join('').toString());
      config = await processConfig(input);

      // 检查是否需要生成代码
      const writeFiles =
        process.argv.includes('--write') || process.env.WRITE_FILES === '1';
      if (
        process.argv.includes('--generate') ||
        process.env.GENERATE_CODE === '1'
      ) {
        generateCode(config, writeFiles);
      } else {
        // 只输出配置
        console.log(JSON.stringify(config, null, 2));
        console.log('\n💡 如需生成代码，请添加 --generate 参数:');
        console.log('   echo ... | node generate-crud.js --generate');
        if (writeFiles) {
          console.log('   添加 --write 参数可实际写入文件');
        }
      }
    } catch (error) {
      console.error('❌ 配置解析失败:', error.message);
      process.exit(1);
    }
  });
}

// 工具函数：下划线转大驼峰（首字母大写）
function toCamelCase(str) {
  return str
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join('');
}

/**
 * 解析 LEFT JOIN 关联字段语法
 * 格式: "left join {表名} on {本表字段}={关联表字段} display {显示字段} as {别名}"
 * 示例: "left join role on role_id=id display name as role_name"
 *
 * @param {string} field - 字段配置字符串
 * @returns {object|null} - 解析结果，失败返回 null
 */
function parseLeftJoin(field) {
  // 检查是否为 LEFT JOIN 语法
  if (
    typeof field !== 'string' ||
    !field.toLowerCase().startsWith('left join ')
  ) {
    return null;
  }

  try {
    // 解析: left join {table} on {local}={foreign} display {field} as {alias}
    const regex =
      /^left join\s+(\w+)\s+on\s+(\w+)\s*=\s*(\w+)\s+display\s+(\w+)\s+as\s+(\w+)$/i;
    const match = field.match(regex);

    if (!match) {
      console.warn(`⚠️  无法解析 LEFT JOIN 语法: ${field}`);
      return null;
    }

    return {
      isLeftJoin: true,
      joinTable: match[1], // role
      localField: match[2], // role_id
      foreignField: match[3], // id
      displayField: match[4], // name
      alias: match[5], // role_name
      originalField: field, // 原始字符串
    };
  } catch (error) {
    console.warn(`⚠️  解析 LEFT JOIN 失败: ${field}`);
    return null;
  }
}

/**
 * 解析字段配置
 * @param {string|object} fieldConfig - 字段配置
 * @returns {object} - 标准化字段配置
 */
function parseFieldConfig(fieldConfig) {
  // 如果是字符串，尝试解析是否为 LEFT JOIN
  if (typeof fieldConfig === 'string') {
    const leftJoin = parseLeftJoin(fieldConfig);
    if (leftJoin) {
      return leftJoin;
    }
    // 普通字段字符串
    return {
      isLeftJoin: false,
      field: fieldConfig,
    };
  }

  // 如果是对象，直接返回
  if (typeof fieldConfig === 'object' && fieldConfig !== null) {
    return {
      isLeftJoin: false,
      ...fieldConfig,
    };
  }

  return { field: String(fieldConfig) };
}

// 生成表单字段组件
function generateFormItem(field, optionsVar = 'selectOptions') {
  const { field: fieldName, type, required, label } = field;
  const rulesRequired = required ? 'true' : 'undefined';

  if (type === 'select') {
    return `        <Form.Item
          name="${fieldName}"
          label="${label}"
          rules={[{ required: ${rulesRequired}, message: '请选择${label}' }]}
        >
          <Select
            placeholder="请选择${label}"
            options={${optionsVar}['${fieldName}'] || []}
          />
        </Form.Item>`;
  }
  if (type === 'password') {
    return `        <Form.Item
          name="${fieldName}"
          label="${label}"
          rules={[{ required: ${rulesRequired}, message: '请输入${label}' }]}
        >
          <Input.Password placeholder="请输入${label}" />
        </Form.Item>`;
  }
  if (type === 'textarea') {
    return `        <Form.Item
          name="${fieldName}"
          label="${label}"
          rules={[{ required: ${rulesRequired}, message: '请输入${label}' }]}
        >
          <Input.TextArea rows={4} placeholder="请输入${label}" />
        </Form.Item>`;
  }
  return `        <Form.Item
          name="${fieldName}"
          label="${label}"
          rules={[{ required: ${rulesRequired}, message: '请输入${label}' }]}
        >
          <Input placeholder="请输入${label}" />
        </Form.Item>`;
}

// 预处理输入配置
function normalizeInput(input) {
  const result = { ...input };

  // 字段名兼容处理
  const fieldMappings = {
    search_field: 'search',
    list_field: 'list',
    create_field: 'create',
    update_field: 'update',
  };

  Object.keys(fieldMappings).forEach((oldKey) => {
    if (
      result[oldKey] !== undefined &&
      result[fieldMappings[oldKey]] === undefined
    ) {
      result[fieldMappings[oldKey]] = result[oldKey];
    }
  });

  // 处理对象格式的数组（用户可能使用了错误的 {} 语法）
  ['search', 'list', 'create', 'update'].forEach((field) => {
    if (result[field] !== undefined) {
      result[field] = normalizeArrayField(result[field]);
    }
  });

  return result;
}

// 将对象格式转换为数组
function normalizeArrayField(field) {
  if (Array.isArray(field)) {
    return field;
  }

  // 如果是对象（用户错误使用了 {} 表示数组）
  if (typeof field === 'object' && field !== null) {
    // 尝试提取对象的值作为数组
    const values = Object.values(field);
    if (values.length > 0 && typeof values[0] !== 'object') {
      return values;
    }
  }

  return field || [];
}

// 查询 system_menu 表获取菜单路径
async function getMenuPath(connection, tableName) {
  try {
    const [rows] = await connection.execute(
      `SELECT path, name, title FROM system_menu WHERE path LIKE '%/${tableName}' AND status = 1 LIMIT 1`,
    );
    if (rows.length > 0) {
      return {
        path: rows[0].path,
        name: rows[0].name,
        title: rows[0].title,
      };
    }
  } catch (error) {
    console.warn(`⚠️  查询菜单表失败: ${error.message}`);
  }
  return null;
}

// 自动注册菜单到 system_menu 表
async function insertMenu(connection, tableName, config) {
  try {
    const path = config.apiRoute.replace('/api/', '/');
    const name = tableName;
    const title = config.mainTable.columns[tableName]?.comment || tableName;
    const icon = 'user';
    const sort = 100;

    await connection.execute(
      `INSERT INTO system_menu (name, title, path, icon, sort, status, is_visible)
       VALUES (?, ?, ?, ?, ?, 1, 1)`,
      [name, title, path, icon, sort],
    );
    console.log(`✅ 已自动添加菜单: ${path}`);
  } catch (error) {
    console.warn(`⚠️  自动添加菜单失败: ${error.message}`);
  }
}

// 处理配置（通用）
async function processConfig(input) {
  const mysql = require('mysql2/promise');

  // 从.env读取数据库配置（作为默认值）
  const envDbConfig = {
    host: env.DB_HOST || 'localhost',
    port: parseInt(env.DB_PORT || '3306'),
    user: env.DB_USER || 'root',
    password: env.DB_PASSWORD || '',
    database: env.DB_NAME || 'project',
  };

  // 优先使用输入配置，否则使用.env配置
  const dbConfig = {
    host: input.host || envDbConfig.host,
    port: input.port || envDbConfig.port,
    user: input.user || envDbConfig.user,
    password: input.password || envDbConfig.password,
    database: input.database || envDbConfig.database,
  };

  // 预处理：支持下划线风格的字段名
  const inputConfig = {
    search: input.search || input.search_field || [],
    list: input.list || input.list_field || [],
    create: input.create || input.create_field || [],
    update: input.update || input.update_field || [],
  };

  // 预处理列表字段中的 LEFT JOIN 语法
  const normalizedList = inputConfig.list.map((field) => {
    if (
      typeof field === 'string' &&
      field.toLowerCase().startsWith('left join ')
    ) {
      return field;
    }
    return field;
  });

  const config = {
    mainTable: { name: input.table, columns: {} },
    refTables: [],
    features: {
      search: inputConfig.search,
      list: normalizedList,
      create: inputConfig.create,
      update: inputConfig.update,
      delete: true,
    },
    apiRoute: input.apiRoute || `/api/${input.table}`,
    mainTablePrimaryKey: input.primaryKey || 'id',
    isSimpleTable: false,
    controllerName: toCamelCase(input.table) + 'Controller',
    // 前端页面路径
    pagePath: input.path || input.table,
  };

  // 连接数据库获取字段注释（即使配置完整也需要获取注释用于 label）
  let connection;
  try {
    connection = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password,
      database: dbConfig.database,
    });

    // 查询菜单路径
    const menuInfo = await getMenuPath(connection, input.table);
    if (menuInfo) {
      console.log(`✅ 找到菜单配置: ${menuInfo.path} (${menuInfo.title})`);
      config.menuPath = menuInfo.path;
    } else {
      console.log(`⚠️  未找到菜单配置: /${input.table}`);
      console.log(`   生成的页面需要手动关联菜单`);
    }

    // 获取表结构
    const [columns] = await connection.execute(
      `SHOW FULL COLUMNS FROM \`${input.table}\``,
    );

    const columnEntries = [];
    columns.forEach((col) => {
      config.mainTable.columns[col.Field] = {
        type: col.Type,
        comment: col.Comment || col.Field,
        nullable: col.Null === 'YES',
        key: col.Key === 'PRI',
      };
      columnEntries.push({
        name: col.Field,
        ...config.mainTable.columns[col.Field],
      });
    });

    // 识别主键
    const primaryKey =
      columnEntries.find((c) => c.key)?.name || config.mainTablePrimaryKey;
    config.mainTablePrimaryKey = primaryKey;

    // 过滤非系统字段（用于简单表自动生成）
    const normalFields = columnEntries.filter(
      (c) =>
        !c.key &&
        !c.name.startsWith('created_') &&
        !c.name.startsWith('updated_') &&
        !c.name.startsWith('deleted_') &&
        c.name !== 'sort' &&
        c.name !== 'status',
    );

    // 检测是否为简单表并自动生成配置
    const isSimple =
      normalFields.length <= 8 &&
      !normalFields.some((f) => f.name.endsWith('_id'));

    config.isSimpleTable = isSimple;

    if (isSimple && input.autoGenerate !== false) {
      console.log(`\n🤖 检测到表 "${input.table}" 是简单表`);
      config.features.list = columnEntries
        .filter(
          (c) =>
            !c.name.startsWith('created_') &&
            !c.name.startsWith('updated_') &&
            !c.name.includes('password'),
        )
        .map((c) => c.name);

      config.features.search = normalFields
        .filter((c) => !c.name.includes('password'))
        .map((c) => ({
          field: c.name,
          type: 'input',
          label: c.comment || c.name,
        }));

      config.features.create = normalFields
        .filter((c) => !c.nullable)
        .map((c) => ({
          field: c.name,
          type: c.name.includes('password')
            ? 'password'
            : c.name.includes('desc') || c.name.includes('remark')
              ? 'textarea'
              : 'input',
          required: true,
          label: c.comment || c.name,
        }));

      config.features.update = normalFields.map((c) => ({
        field: c.name,
        type: c.name.includes('password')
          ? 'password'
          : c.name.includes('desc') || c.name.includes('remark')
            ? 'textarea'
            : 'input',
        label: c.comment || c.name,
      }));
    }

    // 标准化字段配置（确保所有字段都有正确的 label）
    config.features.search = inputConfig.search.map((f) =>
      normalizeSearchField(f, config.mainTable.columns),
    );
    config.features.create = inputConfig.create.map((f) =>
      normalizeFormField(
        f,
        'create',
        config.mainTable.columns,
        inputConfig.search,
      ),
    );
    config.features.update = inputConfig.update.map((f) =>
      normalizeFormField(
        f,
        'update',
        config.mainTable.columns,
        inputConfig.search,
      ),
    );

    await connection.end();
    return config;
  } catch (error) {
    console.warn(`⚠️  数据库连接失败: ${error.message}`);
    // 即使数据库连接失败，也使用默认配置
    config.features.search = inputConfig.search.map((f) =>
      normalizeSearchField(f, {}),
    );
    config.features.create = inputConfig.create.map((f) =>
      normalizeFormField(f, 'create', {}, inputConfig.search),
    );
    config.features.update = inputConfig.update.map((f) =>
      normalizeFormField(f, 'update', {}, inputConfig.search),
    );
  }

  await connection.end();
  return config;
}

// 标准化搜索字段
function normalizeSearchField(field, columns = {}) {
  if (typeof field === 'object' && field !== null) {
    // 如果没有提供 label，从数据库注释获取
    if (!field.label && columns[field.field]) {
      field.label = columns[field.field].comment || field.field;
    }
    return field;
  }
  return {
    field: field,
    type: 'input',
    label: columns[field]?.comment || field,
  };
}

// 标准化表单字段
// searchConfig: 用于从 search_field 中获取 select 类型的配置
function normalizeFormField(field, mode, columns = {}, searchConfig = []) {
  if (typeof field === 'object' && field !== null) {
    // 如果没有提供 label，从数据库注释获取
    if (!field.label && columns[field.field]) {
      field.label = columns[field.field].comment || field.field;
    }
    return field;
  }

  // 如果是字符串，先从 search_field 中查找是否有 select 类型的配置
  const searchSelectConfig = searchConfig.find(
    (f) => typeof f === 'object' && f.field === field && f.type === 'select',
  );
  if (searchSelectConfig) {
    // 从数据库注释获取 label
    const fieldLabel = columns[field]?.comment || field;
    return { ...searchSelectConfig, label: fieldLabel };
  }

  const isCreate = mode === 'create';
  let type = 'input';
  let required = false;

  if (field.includes('password')) {
    type = 'password';
    required = isCreate;
  } else if (
    field.includes('desc') ||
    field.includes('remark') ||
    field.includes('content')
  ) {
    type = 'textarea';
  } else if (field.includes('_id')) {
    type = 'select';
  }

  // 从数据库注释获取 label
  const fieldLabel = columns[field]?.comment || field;

  return {
    field: field,
    type: type,
    label: fieldLabel,
    required: required,
  };
}

// 输出配置
function outputConfig(config) {
  console.log(JSON.stringify(config, null, 2));
}

// 主流程
async function main() {
  const mysql = require('mysql2/promise');

  console.log('\n' + '='.repeat(60));
  console.log('🎉 交互式 CRUD 代码生成器');
  console.log('='.repeat(60));

  console.log(`\n📖 数据库配置 (从 .env 读取):`);
  console.log(`   主机: ${dbConfig.host}:${dbConfig.port}`);
  console.log(`   用户: ${dbConfig.user}`);
  console.log(`   数据库: ${dbConfig.database}`);

  let connection;
  try {
    connection = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password,
      database: dbConfig.database,
    });
    console.log('✅ 数据库连接成功\n');

    await selectMainTable(connection);
    await selectListFields();
    await selectSearchFields(connection);
    await selectPrimaryKey();
    await selectCreateFields();
    await selectUpdateFields();
    await confirmAndGenerate();
  } catch (error) {
    console.error('\n❌ 发生错误:', error.message);
  } finally {
    if (connection) await connection.end();
    rl.close();
  }
}

// ============================================================
// 代码生成器
// ============================================================

function generateFrontendDataTypes(config) {
  const tableName = config.mainTable.name;
  const className = tableName
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join('');

  const columns = Object.entries(config.mainTable.columns)
    .map(([name, col]) => {
      let tsType = 'string';
      if (col.type.startsWith('int') || col.type.startsWith('tinyint'))
        tsType = 'number';
      if (col.type === 'datetime' || col.type === 'timestamp')
        tsType = 'string';
      if (col.type === 'json') tsType = 'Record<string, any>';
      return `  ${name}: ${tsType}${col.nullable ? '?' : ''};`;
    })
    .join('\n');

  return `export type ${className}Item = {
${columns}
};

export type ${className}ListParams = {
  current?: number;
  page?: number;
  pageSize?: number;
  name?: string;
  sorter?: string;
  order?: 'ascend' | 'descend';
};

export type ${className}ListResponse = {
  success: boolean;
  data: ${className}Item[];
  total: number;
  page: number;
  pageSize: number;
};

export type ${className}FormData = {
  id?: number;
${config.features.create.map((f) => `  ${f.field}: ${f.type === 'select' ? 'number' : 'string'};`).join('\n')}
};
`;
}

function generateFrontendService(config) {
  const tableName = config.mainTable.name;
  const apiRoute = config.apiRoute;
  const className = tableName
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join('');

  // 收集 select 类型的字段（去重）
  const selectFields = [
    ...config.features.search,
    ...config.features.create,
    ...config.features.update,
  ]
    .filter((f) => f.type === 'select')
    // 去重：根据 field 字段去重
    .filter(
      (f, index, self) => index === self.findIndex((t) => t.field === f.field),
    )
    .map(
      (f) => `
 // ${f.label} 下拉选项
 export async function get${f.field.charAt(0).toUpperCase() + f.field.slice(1)}Options() {
   return request<{ data: { ${f.displayField}: string; ${f.valueField}: number }[] }>('${f.api}', {
     method: 'GET',
   });
 }`,
    )
    .join('');

  return `import { request } from '@umijs/max';
import type {
  ${className}FormData,
  ${className}Item,
  ${className}ListParams,
  ${className}ListResponse,
} from './data';

export async function query${className}List(params: ${className}ListParams) {
  return request<${className}ListResponse>('${apiRoute}', {
    method: 'GET',
    params,
  });
}

export async function get${className}Detail(id: number) {
  return request<{ success: boolean; data: ${className}Item }>(\`${apiRoute}/\${id}\`, {
    method: 'GET',
  });
}

export async function create${className}(data: ${className}FormData) {
  return request<{ success: boolean; message: string }>('${apiRoute}', {
    method: 'POST',
    data,
  });
}

export async function update${className}(id: number, data: ${className}FormData) {
  return request<{ success: boolean; message: string }>(\`${apiRoute}/\${id}\`, {
    method: 'PUT',
    data,
  });
}

export async function delete${className}(id: number) {
  return request<{ success: boolean; message: string }>(\`${apiRoute}/\${id}\`, {
    method: 'DELETE',
  });
}${selectFields}
`;
}

function generateFrontendIndex(config) {
  const tableName = config.mainTable.name;
  const componentName = tableName
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join('');
  const pageTitle = config.mainTable.comment || componentName;

  // 生成搜索列配置
  const searchColumns = config.features.search
    .map((f) => {
      if (f.type === 'select') {
        return `    {
      title: '${f.label}',
      dataIndex: '${f.field}',
      valueType: 'select',
      fieldProps: {
        options: selectOptions['${f.field}'] || [],
        onChange: () => actionRef.current?.reload(),
        allowClear: true,
        placeholder: '请选择${f.label}',
      },
    },`;
      }
      return `    {
      title: '${f.label}',
      dataIndex: '${f.field}',
      valueType: 'text',
      fieldProps: {
        allowClear: true,
        placeholder: '请输入${f.label}',
      },
    },`;
    })
    .join('\n');

  // 收集搜索字段名
  const searchFieldNames = config.features.search.map((f) =>
    typeof f === 'string' ? f : f.field,
  );

  // 生成列表列配置（支持 LEFT JOIN 字段，排除搜索列中已有的字段）
  // 过滤并排序，确保 id 列在最前面
  const listFieldNames = config.features.list
    .filter((f) => {
      const fieldName = typeof f === 'string' ? f : null;
      if (!fieldName) return true; // LEFT JOIN 等复杂字段保留
      // 排除已在搜索列中的字段，避免重复
      return !searchFieldNames.includes(fieldName);
    })
    .sort((a, b) => {
      // 确保 id 在最前面
      const aIsId = typeof a === 'string' && a === 'id';
      const bIsId = typeof b === 'string' && b === 'id';
      if (aIsId) return -1;
      if (bIsId) return 1;
      return 0;
    });

  const listColumns = listFieldNames
    .map((f) => {
      const parsed = parseFieldConfig(f);
      const key = parsed.isLeftJoin
        ? `list-${parsed.alias}`
        : `list-${typeof f === 'string' ? f : 'unknown'}`;
      if (parsed.isLeftJoin) {
        return `    {
      title: '${toCamelCase(parsed.displayField)}',
      dataIndex: '${parsed.alias}',
      key: '${key}',
      search: false,
      sorter: true,
    },`;
      }
      return `    {
      title: '${config.mainTable.columns[f]?.comment || f}',
      dataIndex: '${f}',
      key: '${key}',
      search: false,
      sorter: true,
    },`;
    })
    .join('\n');

  // 生成请求参数映射
  const requestParams = config.features.search
    .map((f) => `${f.field}: params.${f.field}`)
    .join(',\n            ');

  // 生成表单字段
  const formItems = config.features.create
    .map((f) => generateFormItem(f, 'selectOptions'))
    .join('\n\n');

  // 收集 select 类型的字段（去重）
  const uniqueSelectFields = [
    ...config.features.search,
    ...config.features.create,
    ...config.features.update,
  ]
    .filter((f) => f.type === 'select')
    .filter(
      (f, index, self) => index === self.findIndex((t) => t.field === f.field),
    );

  return `import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
  import type { ActionType, ProColumns } from '@ant-design/pro-components';
  import { ProTable } from '@ant-design/pro-components';
  import { Button, Form, Input, Modal, Select, message } from 'antd';
  import React, { useEffect, useRef, useState } from 'react';
  import type { ${componentName}Item } from './data';
  import { create${componentName}, delete${componentName}, query${componentName}List, update${componentName}${
    uniqueSelectFields.length > 0
      ? `, ${uniqueSelectFields
          .map(
            (f) =>
              `get${f.field.charAt(0).toUpperCase() + f.field.slice(1)}Options`,
          )
          .join(', ')}`
      : ''
  } } from './service';
  import useStyles from './style.style';

  interface SelectOption {
    label: string;
    value: number | string;
  }

  const ${componentName}List: React.FC = () => {
    const actionRef = useRef<ActionType>(null);
    const { styles } = useStyles();
    const [modalVisible, setModalVisible] = useState(false);
    const [editing${componentName}, setEditing${componentName}] = useState<${componentName}Item | null>(null);
    const [form] = Form.useForm();
    const [pageSize, setPageSize] = useState(10);
 ${
   uniqueSelectFields.length > 0
     ? `
    const [selectOptions, setSelectOptions] = useState<Record<string, SelectOption[]>>({});

    useEffect(() => {
      fetchSelectOptions();
    }, []);

    const fetchSelectOptions = async () => {
      const options: Record<string, SelectOption[]> = {};
${uniqueSelectFields
  .map(
    (f) =>
      `      const ${f.field}Res = await get${f.field.charAt(0).toUpperCase() + f.field.slice(1)}Options();
      options['${f.field}'] = ${f.field}Res.data.map((item: any) => ({
        label: item.${f.displayField},
        value: item.${f.valueField},
      }));`,
  )
  .join('\n')}
      setSelectOptions(options);
    };`
     : ''
 }

  const handleAdd = () => {
    setEditing${componentName}(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: ${componentName}Item) => {
    setEditing${componentName}(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条记录吗？',
      onOk: async () => {
        const res = await delete${componentName}(id);
        if (res.success) {
          message.success('删除成功');
          actionRef.current?.reload();
        } else {
          message.error(res.message || '删除失败');
        }
      },
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editing${componentName}) {
        const res = await update${componentName}(editing${componentName}.id, values);
        if (res.success) {
          message.success('更新成功');
          setModalVisible(false);
          actionRef.current?.reload();
        } else {
          message.error(res.message || '更新失败');
        }
      } else {
        const res = await create${componentName}(values);
        if (res.success) {
          message.success('创建成功');
          setModalVisible(false);
          actionRef.current?.reload();
        } else {
          message.error(res.message || '创建失败');
        }
      }
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  const columns: ProColumns<${componentName}Item>[] = [
${listColumns}
${searchColumns}
    {
      title: '操作',
      dataIndex: 'option',
      search: false,
      render: (_, record) => {
        const isSystem = record.${config.mainTablePrimaryKey} === 1;
        return [
          !isSystem && (
            <Button
              type="link"
              key="edit"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            >
              编辑
            </Button>
          ),
          !isSystem && (
            <Button
              type="link"
              danger
              key="delete"
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record.${config.mainTablePrimaryKey})}
            >
              删除
            </Button>
          ),
        ];
      },
    },
  ];

  return (
    <div className={styles.tableList}>
      <ProTable<${componentName}Item>
        headerTitle="${pageTitle}"
        actionRef={actionRef}
        rowKey="${config.mainTablePrimaryKey}"
        search={{
          labelWidth: 80,
          span: 6,
        }}
        toolBarRender={() => [
          <Button
            key="add"
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            新建
          </Button>,
        ]}
        request={async (params, sorter) => {
          const sortField = Object.keys(sorter)[0] || '';
          const sortOrder =
            sorter[sortField] === 'ascend'
              ? 'ascend'
              : sorter[sortField] === 'descend'
                ? 'descend'
                : undefined;

          const res = await query${componentName}List({
            current: params.current,
            pageSize: pageSize,
            ${requestParams}${requestParams ? ',' : ''}
            sorter: sortField,
            order: sortOrder,
          });

          return {
            data: res.data,
            total: res.total,
            success: res.success,
          };
        }}
        pagination={{
          pageSize,
          pageSizeOptions: ['10', '20', '50', '100'],
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => \`共 \${total} 条\`,
          onShowSizeChange: (_current, size) => {
            setPageSize(size);
            actionRef.current?.reload();
          },
        }}
        columns={columns}
      />

      <Modal
        title={editing${componentName} ? '编辑${pageTitle}' : '新建${pageTitle}'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={500}
      >
        <Form form={form} layout="vertical">
${formItems}
        </Form>
      </Modal>
    </div>
  );
};

export default ${componentName}List;
`;
}

function generateBackendController(config) {
  const tableName = config.mainTable.name;
  const primaryKey = config.mainTablePrimaryKey;
  const controllerName = config.controllerName;
  const className = tableName
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join('');
  const entityName = config.mainTable.comment || className;

  // 处理 list 字段中的 LEFT JOIN
  const listFields = config.features.list || [];
  const leftJoinFields = [];
  const normalListFields = [];

  listFields.forEach((field) => {
    const parsed = parseFieldConfig(field);
    if (parsed.isLeftJoin) {
      leftJoinFields.push(parsed);
    } else {
      normalListFields.push(field);
    }
  });

  // 生成搜索条件
  const searchConditions = config.features.search
    .map((f) => {
      const fieldName = f.field;
      if (f.type === 'select') {
        return `        if (!empty($${fieldName})) {
            $builder->where('${tableName}.${fieldName}', $${fieldName});
        }`;
      }
      return `        if (!empty($${fieldName})) {
            $builder->like('${tableName}.${fieldName}', $${fieldName});
        }`;
    })
    .join('\n\n');

  // 生成 LEFT JOIN 语句
  const leftJoinStatements = leftJoinFields
    .map((f) => {
      return `        $builder->join('${f.joinTable}', '${f.joinTable}.${f.foreignField} = ${tableName}.${f.localField}', 'left');`;
    })
    .join('\n');

  // 生成 SELECT 字段（包含 LEFT JOIN 的别名）
  const selectFields = normalListFields.join(', ');
  const leftJoinSelectFields = leftJoinFields
    .map((f) => `${f.joinTable}.${f.displayField} as ${f.alias}`)
    .join(', ');
  // 普通列表字段加表名前缀
  const normalSelectFields = normalListFields
    .map((f) => `${tableName}.${f}`)
    .join(', ');
  const allSelectFields =
    normalSelectFields +
    (leftJoinSelectFields
      ? (normalSelectFields ? ', ' : '') + leftJoinSelectFields
      : '');

  // 生成创建字段处理
  const createFields = config.features.create
    .map((f) => {
      if (f.type === 'password') {
        return `            '${f.field}' => password_hash($${f.field}, PASSWORD_DEFAULT),`;
      }
      return `            '${f.field}' => $${f.field},`;
    })
    .join('\n');

  // 生成更新字段处理
  const updateFields = config.features.update
    .map((f) => {
      if (f.type === 'password') {
        return `        if (!empty($${f.field})) {
            $db->table('${tableName}')->where('${primaryKey}', $id)->update([
                '${f.field}' => password_hash($${f.field}, PASSWORD_DEFAULT),
            ]);
        }`;
      }
      return `        $db->table('${tableName}')->where('${primaryKey}', $id)->update([
            '${f.field}' => $${f.field},
        ]);`;
    })
    .join('\n\n');

  return `<?php

namespace App\\Controllers;

/**
 * ${entityName} Controller
 * ${entityName} 管理 API
 *
 * LEFT JOIN 关联字段语法:
 *   "left join {表名} on {本表字段}={关联表字段} display {显示字段} as {别名}"
 *
 * 示例: "left join role on role_id=id display name as role_name"
 */
class ${controllerName} extends \\CodeIgniter\\Controller
{
    public function index()
    {
        return $this->response->setJSON([
            'status' => 200,
            'message' => '${entityName} API',
        ]);
    }

    /**
     * 获取${entityName}列表
     * 列表查询支持分页、搜索、排序
     *
     * 支持 LEFT JOIN 关联查询:
     *   配置: "left join role on role_id=id display name as role_name"
     *   生成: SELECT *, role.name as role_name FROM ${tableName}
     *         LEFT JOIN role ON role.id = ${tableName}.role_id
     */
    public function list()
    {
        $page = (int) ($this->request->getGet('current') ?? $this->request->getGet('page') ?? 1);
        $pageSize = (int) ($this->request->getGet('pageSize') ?? 20);
${config.features.search.map((f) => `        $${f.field} = $this->request->getGet('${f.field}');`).join('\n')}
        $sorter = $this->request->getGet('sorter');
        $order = $this->request->getGet('order');

        $db = \\Config\\Database::connect();
        $builder = $db->table('${tableName}');

        // SELECT 字段（包含 LEFT JOIN 别名字段）
        $builder->select('${allSelectFields}');

${leftJoinStatements || '        // 无关联表查询'}

${searchConditions}

        $total = $builder->countAllResults(false);

        if (!empty($sorter) && !empty($order)) {
            $orderDirection = $order === 'ascend' ? 'ASC' : 'DESC';
            $builder->orderBy($sorter, $orderDirection);
        } else {
            $builder->orderBy('${primaryKey}', 'DESC');
        }

        $builder->limit($pageSize, ($page - 1) * $pageSize);
        $${tableName} = $builder->get()->getResultArray();

        return $this->response->setJSON([
            'success' => true,
            'data' => $${tableName},
            'total' => $total,
            'page' => $page,
            'pageSize' => $pageSize,
        ]);
    }

    /**
     * 获取${entityName}详情
     */
    public function detail($id)
    {
        $db = \\Config\\Database::connect();
        $builder = $db->table('${tableName}');
        $builder->where('${primaryKey}', $id);
        $${tableName} = $builder->get()->getRowArray();

        if (!$${tableName}) {
            return $this->response->setJSON([
                'success' => false,
                'message' => '${entityName}不存在',
            ])->setStatusCode(404);
        }

        return $this->response->setJSON([
            'success' => true,
            'data' => $${tableName},
        ]);
    }

    /**
     * 创建${entityName}
     * 注意：获取表单数据时需同时支持 JSON 和 form-data 格式
     */
    public function create()
    {
        $json = $this->request->getJSON(true);
${config.features.create.map((f) => `        $${f.field} = $json['${f.field}'] ?? $this->request->getPost('${f.field}');`).join('\n')}

        // 验证必填字段
${config.features.create
  .filter((f) => f.required)
  .map(
    (f) => `        if (empty($${f.field})) {
            return $this->response->setJSON([
                'success' => false,
                'message' => '${f.label}不能为空',
            ])->setStatusCode(400);
        }`,
  )
  .join('\n\n')}

        $db = \\Config\\Database::connect();

        // 检查重复
        $builder = $db->table('${tableName}');
${config.features.create
  .filter((f) => f.type !== 'password' && f.type !== 'textarea')
  .map((f) => `        $builder->where('${f.field}', $${f.field});`)
  .join('\n')}
        if ($builder->countAllResults(false) > 0) {
            return $this->response->setJSON([
                'success' => false,
                'message' => '记录已存在',
            ])->setStatusCode(400);
        }

        $db->table('${tableName}')->insert([
${createFields}
        ]);

        return $this->response->setJSON([
            'success' => true,
            'message' => '创建成功',
        ]);
    }

    /**
     * 更新${entityName}
     * 注意：获取表单数据时需同时支持 JSON 和 form-data 格式
     */
    public function update($id)
    {
        if ($id == 1) {
            return $this->response->setJSON([
                'success' => false,
                'message' => '系统记录不能修改',
            ])->setStatusCode(403);
        }

        $json = $this->request->getJSON(true);
${config.features.update.map((f) => `        $${f.field} = $json['${f.field}'] ?? $this->request->getPost('${f.field}');`).join('\n')}

        $db = \\Config\\Database::connect();

        // 检查是否存在
        $builder = $db->table('${tableName}');
        $builder->where('${primaryKey}', $id);
        if (!$builder->get()->getRowArray()) {
            return $this->response->setJSON([
                'success' => false,
                'message' => '${entityName}不存在',
            ])->setStatusCode(404);
        }

${updateFields}

        return $this->response->setJSON([
            'success' => true,
            'message' => '更新成功',
        ]);
    }

    /**
     * 删除${entityName}
     */
    public function delete($id)
    {
        if ($id == 1) {
            return $this->response->setJSON([
                'success' => false,
                'message' => '系统记录不能删除',
            ])->setStatusCode(403);
        }

        $db = \\Config\\Database::connect();

        $builder = $db->table('${tableName}');
        $builder->where('${primaryKey}', $id);
        $${tableName} = $builder->get()->getRowArray();

        if (!$${tableName}) {
            return $this->response->setJSON([
                'success' => false,
                'message' => '${entityName}不存在',
            ])->setStatusCode(404);
        }

        $db->table('${tableName}')->where('${primaryKey}', $id)->delete();

        return $this->response->setJSON([
            'success' => true,
            'message' => '删除成功',
        ]);
    }
}
`;
}

function generateBackendRoutes(config) {
  const tableName = config.mainTable.name;
  const controllerName = config.controllerName;

  return `// ${tableName} 路由配置 (添加到 Config/Routes.php)
$routes->get('${tableName}', '${controllerName}::list');
$routes->get('${tableName}/(:num)', '${controllerName}::detail/$1');
$routes->post('${tableName}', '${controllerName}::create');
$routes->put('${tableName}/(:num)', '${controllerName}::update/$1');
$routes->delete('${tableName}/(:num)', '${controllerName}::delete/$1');`;
}

function generateCode(config, writeFiles = false) {
  console.log('\n' + '='.repeat(60));
  console.log('📦 生成的代码');
  console.log('='.repeat(60));

  // 根据 path 生成前端文件路径
  const pagePath = config.pagePath || config.mainTable.name;
  const pagePathParts = pagePath.split('/').filter(Boolean);
  const pageDir = pagePathParts.join('/');

  // 生成的文件内容
  const dataDts = generateFrontendDataTypes(config);
  const serviceTs = generateFrontendService(config);
  const indexTsx = generateFrontendIndex(config);
  const styleStyle = `import { createStyles } from 'antd-style';

  const useStyles = createStyles(() => ({
    tableList: {
      padding: '24px 0',
    },
  }));

  export default useStyles;
  `;

  // 1. 前端 data.d.ts
  console.log('\n📄 src/pages/' + pageDir + '/data.d.ts\n');
  console.log('```typescript');
  console.log(dataDts);
  console.log('```');

  // 2. 前端 service.ts
  console.log('\n📄 src/pages/' + pageDir + '/service.ts\n');
  console.log('```typescript');
  console.log(serviceTs);
  console.log('```');

  // 3. 前端 index.tsx
  console.log('\n📄 src/pages/' + pageDir + '/index.tsx\n');
  console.log('```tsx');
  console.log(indexTsx);
  console.log('```');

  // 实际写入文件
  if (writeFiles) {
    // 前端页面目录: src/pages/admin/admin-list
    const frontendBaseDir = path.join(
      '/home/quqiufeng/myapp/src/pages',
      ...pagePathParts,
    );

    try {
      // 确保目录存在
      if (!fs.existsSync(frontendBaseDir)) {
        fs.mkdirSync(frontendBaseDir, { recursive: true });
        console.log('\n✅ 创建目录:', frontendBaseDir);
      }

      // 写入文件
      fs.writeFileSync(
        path.join(frontendBaseDir, 'data.d.ts'),
        dataDts,
        'utf-8',
      );
      fs.writeFileSync(
        path.join(frontendBaseDir, 'service.ts'),
        serviceTs,
        'utf-8',
      );
      fs.writeFileSync(
        path.join(frontendBaseDir, 'index.tsx'),
        indexTsx,
        'utf-8',
      );
      fs.writeFileSync(
        path.join(frontendBaseDir, 'style.style.ts'),
        styleStyle,
        'utf-8',
      );

      console.log('\n✅ 前端文件已写入:');
      console.log('   ', path.join(frontendBaseDir, 'data.d.ts'));
      console.log('   ', path.join(frontendBaseDir, 'service.ts'));
      console.log('   ', path.join(frontendBaseDir, 'index.tsx'));
      console.log('   ', path.join(frontendBaseDir, 'style.style.ts'));
    } catch (error) {
      console.log('\n⚠️  写入文件失败:', error.message);
    }

    // 写入后端 Controller
    const backendControllerPath =
      '/var/www/web/myapp/Controllers/' + config.controllerName + '.php';
    const controllerCode = generateBackendController(config);
    try {
      if (fs.existsSync(path.dirname(backendControllerPath))) {
        fs.writeFileSync(backendControllerPath, controllerCode, 'utf-8');
        console.log('\n✅ 后端 Controller 已写入:');
        console.log('   ', backendControllerPath);
      }
    } catch (error) {
      console.log('\n⚠️  写入 Controller 失败:', error.message);
    }
  }

  // 4. 后端 Controller
  console.log('\n📄 后端 Controllers/' + config.controllerName + '.php\n');
  console.log('```php');
  console.log(generateBackendController(config));
  console.log('```');

  // 5. 后端路由配置
  const routeConfig = generateBackendRoutes(config);
  console.log('\n📄 后端路由配置 (添加到 Config/Routes.php)\n');
  console.log('```php');
  console.log(routeConfig);
  console.log('```');

  // 直接写入 Routes.php
  const backendRoutesPath = '/var/www/web/myapp/Config/Routes.php';
  try {
    if (fs.existsSync(backendRoutesPath)) {
      let routesContent = fs.readFileSync(backendRoutesPath, 'utf-8');
      const tableName = config.mainTable.name;
      const routePattern = new RegExp(`//\\s*${tableName}\\s*路由配置`);
      if (routePattern.test(routesContent)) {
        console.log(`\n⚠️  路由配置已存在: ${tableName}`);
      } else {
        // 在 "//新增的路由" 注释后追加
        const newRoutes =
          '\n' +
          routeConfig
            .split('\n')
            .map((line) => '    ' + line)
            .join('\n') +
          '\n';
        routesContent = routesContent.replace(
          '//新增的路由',
          '//新增的路由' + newRoutes,
        );
        fs.writeFileSync(backendRoutesPath, routesContent, 'utf-8');
        console.log(`\n✅ 路由配置已写入: ${backendRoutesPath}`);
      }
    } else {
      console.log(`\n⚠️  Routes.php 不存在: ${backendRoutesPath}`);
      console.log('   请手动添加路由配置');
    }
  } catch (error) {
    console.log(`\n⚠️  写入路由配置失败: ${error.message}`);
  }

  console.log('\n' + '='.repeat(60));
  console.log('💡 提示: 代码已生成，请复制到对应文件');
  console.log('='.repeat(60));
}

async function confirmAndGenerate() {
  console.log('\n' + '='.repeat(60));
  console.log('📋 配置确认');
  console.log('='.repeat(60));

  console.log(`\n📦 主表: ${config.mainTable.name}`);
  console.log(`🌐 控制器: ${config.controllerName}`);
  console.log(`🌐 API 路由: ${config.apiRoute}`);
  console.log(`🔑 主键: ${config.mainTablePrimaryKey}`);

  console.log(`\n📊 列表字段: ${config.features.list.join(', ')}`);

  console.log(`\n🔍 搜索字段:`);
  config.features.search.forEach((field) => {
    if (field.type === 'select') {
      console.log(
        `   - ${field.field} → 选择框 (${field.refTable}.${field.displayField})`,
      );
    } else {
      console.log(`   - ${field.field} → 输入框`);
    }
  });

  console.log(`\n✨ 新建必填字段:`);
  config.features.create.forEach((field) => {
    console.log(`   - ${field.field} (${field.type})`);
  });

  console.log(`\n✏️ 更新字段:`);
  config.features.update.forEach((field) => {
    console.log(`   - ${field.field} (${field.type})`);
  });

  console.log('\n' + '='.repeat(60));

  const confirm = await ask('✅ 确认生成代码? (y/n): ');
  if (confirm.toLowerCase() === 'y') {
    generateCode(config, true); // 交互模式直接写入
  } else {
    console.log('\n❌ 已取消生成');
  }
}
