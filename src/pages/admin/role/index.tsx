import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
  import type { ActionType, ProColumns } from '@ant-design/pro-components';
  import { ProTable } from '@ant-design/pro-components';
  import { Button, Form, Input, Modal, Select, message } from 'antd';
  import React, { useEffect, useRef, useState } from 'react';
  import type { RoleItem } from './data';
  import { createRole, deleteRole, queryRoleList, updateRole } from './service';
  import useStyles from './style.style';

  interface SelectOption {
    label: string;
    value: number | string;
  }

  const RoleList: React.FC = () => {
    const actionRef = useRef<ActionType>(null);
    const { styles } = useStyles();
    const [modalVisible, setModalVisible] = useState(false);
    const [editingRole, setEditingRole] = useState<RoleItem | null>(null);
    const [form] = Form.useForm();
    const [pageSize, setPageSize] = useState(10);
 

  const handleAdd = () => {
    setEditingRole(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: RoleItem) => {
    setEditingRole(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条记录吗？',
      onOk: async () => {
        const res = await deleteRole(id);
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
      if (editingRole) {
        const res = await updateRole(editingRole.id, values);
        if (res.success) {
          message.success('更新成功');
          setModalVisible(false);
          actionRef.current?.reload();
        } else {
          message.error(res.message || '更新失败');
        }
      } else {
        const res = await createRole(values);
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

  const columns: ProColumns<RoleItem>[] = [
    {
      title: '角色ID',
      dataIndex: 'id',
      key: 'list-id',
      search: false,
      sorter: true,
    },
    {
      title: '角色名',
      dataIndex: 'name',
      valueType: 'text',
      fieldProps: {
        allowClear: true,
        placeholder: '请输入角色名',
      },
    },
    {
      title: '操作',
      dataIndex: 'option',
      search: false,
      render: (_, record) => {
        const isSystem = record.id === 1;
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
              onClick={() => handleDelete(record.id)}
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
      <ProTable<RoleItem>
        headerTitle="Role"
        actionRef={actionRef}
        rowKey="id"
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

          const res = await queryRoleList({
            current: params.current,
            pageSize: pageSize,
            name: params.name,
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
          showTotal: (total) => `共 ${total} 条`,
          onShowSizeChange: (_current, size) => {
            setPageSize(size);
            actionRef.current?.reload();
          },
        }}
        columns={columns}
      />

      <Modal
        title={editingRole ? '编辑Role' : '新建Role'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={500}
      >
        <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label="角色名"
          rules={[{ required: undefined, message: '请输入角色名' }]}
        >
          <Input placeholder="请输入角色名" />
        </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RoleList;
