#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function main() {
  // 从 .env 读取数据库配置
  const env = {};
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf-8');
    content.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...values] = trimmed.split('=');
        if (key) env[key.trim()] = values.join('=').trim();
      }
    });
  }

  const dbConfig = {
    host: env.DB_HOST || 'localhost',
    port: parseInt(env.DB_PORT || '3306'),
    user: env.DB_USER || 'root',
    password: env.DB_PASSWORD || '',
    database: env.DB_NAME || 'project',
  };

  const connection = await mysql.createConnection(dbConfig);
  
  // 查询缺失的页面路径
  const [rows] = await connection.execute(`
    SELECT DISTINCT path FROM system_menu 
    WHERE status = 1 AND path LIKE '/admin/%' AND path != '/admin'
  `);
  
  await connection.end();

  const baseDir = '/home/quqiufeng/myapp/src/pages';
  
  for (const row of rows) {
    const pagePath = row.path;
    const pathParts = pagePath.split('/').filter(Boolean);
    const dirPath = path.join(baseDir, ...pathParts);
    
    // 检查是否已存在
    if (fs.existsSync(path.join(dirPath, 'index.tsx'))) {
      console.log('✅ 已存在:', pagePath);
      continue;
    }
    
    // 获取表名（path 最后一部分）
    const tableName = pathParts[pathParts.length - 1];
    const componentName = tableName.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
    
    // 创建目录
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    
    // 生成 index.tsx
    const indexCode = `import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { Button, Form, Input, Modal, message } from 'antd';
import React, { useRef, useState } from 'react';
import type { ${componentName}Item } from './data';

const ${componentName}List: React.FC = () => {
  const actionRef = useRef<ActionType>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<${componentName}Item | null>(null);
  const [form] = Form.useForm();

  const columns: ProColumns<${componentName}Item>[] = [
    {
      title: '操作',
      dataIndex: 'option',
      search: false,
      render: (_, record) => [
        <Button
          type="link"
          key="edit"
          icon={<EditOutlined />}
          onClick={() => handleEdit(record)}
        >
          编辑
        </Button>,
        <Button
          type="link"
          danger
          key="delete"
          icon={<DeleteOutlined />}
          onClick={() => handleDelete(record.id)}
        >
          删除
        </Button>,
      ],
    },
  ];

  const handleAdd = () => {
    setEditingItem(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: ${componentName}Item) => {
    setEditingItem(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条记录吗？',
      onOk: async () => {
        message.success('删除成功');
        actionRef.current?.reload();
      },
    });
  };

  const handleSubmit = async () => {
    message.success(editingItem ? '更新成功' : '创建成功');
    setModalVisible(false);
    actionRef.current?.reload();
  };

  return (
    <div>
      <ProTable<${componentName}Item>
        headerTitle="${componentName}"
        actionRef={actionRef}
        rowKey="id"
        toolBarRender={() => [
          <Button key="add" type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新建
          </Button>,
        ]}
        columns={columns}
        request={() => Promise.resolve({ data: [], success: true })}
      />
      <Modal
        title={editingItem ? '编辑' : '新建'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
      >
        <Form form={form} layout="vertical">
        </Form>
      </Modal>
    </div>
  );
};

export default ${componentName}List;
`;
    
    fs.writeFileSync(path.join(dirPath, 'index.tsx'), indexCode, 'utf-8');
    
    // 生成 data.d.ts
    const dataCode = `export type ${componentName}Item = {
  id: number;
};

export type ${componentName}ListParams = {
  current?: number;
  page?: number;
  pageSize?: number;
};
`;
    fs.writeFileSync(path.join(dirPath, 'data.d.ts'), dataCode, 'utf-8');
    
    // 生成 service.ts
    const serviceCode = `import { request } from '@umijs/max';
import type { ${componentName}Item, ${componentName}ListParams } from './data';

export async function query${componentName}List(params: ${componentName}ListParams) {
  return request('/api/${tableName}', { method: 'GET', params });
}

export async function create${componentName}(data: Partial<${componentName}Item>) {
  return request('/api/${tableName}', { method: 'POST', data });
}

export async function update${componentName}(id: number, data: Partial<${componentName}Item>) {
  return request(\`/api/${tableName}/\${id}\`, { method: 'PUT', data });
}

export async function delete${componentName}(id: number) {
  return request(\`/api/${tableName}/\${id}\`, { method: 'DELETE' });
}
`;
    fs.writeFileSync(path.join(dirPath, 'service.ts'), serviceCode, 'utf-8');
    
    console.log('✅ 生成:', pagePath);
  }
}

main().catch(console.error);
