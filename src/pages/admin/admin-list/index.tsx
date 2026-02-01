import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
  import type { ActionType, ProColumns } from '@ant-design/pro-components';
  import { ProTable } from '@ant-design/pro-components';
  import { Button, Form, Input, Modal, Select, message } from 'antd';
  import React, { useEffect, useRef, useState } from 'react';
  import type { AdminItem } from './data';
  import { createAdmin, deleteAdmin, queryAdminList, updateAdmin, getRole_idOptions } from './service';
  import useStyles from './style.style';

  interface SelectOption {
    label: string;
    value: number | string;
  }

  const AdminList: React.FC = () => {
    const actionRef = useRef<ActionType>(null);
    const { styles } = useStyles();
    const [modalVisible, setModalVisible] = useState(false);
    const [editingAdmin, setEditingAdmin] = useState<AdminItem | null>(null);
    const [form] = Form.useForm();
    const [pageSize, setPageSize] = useState(10);
 
    const [selectOptions, setSelectOptions] = useState<Record<string, SelectOption[]>>({});

    useEffect(() => {
      fetchSelectOptions();
    }, []);

    const fetchSelectOptions = async () => {
      const options: Record<string, SelectOption[]> = {};
      const role_idRes = await getRole_idOptions();
      options['role_id'] = role_idRes.data.map((item: any) => ({
        label: item.name,
        value: item.id,
      }));
      setSelectOptions(options);
    };

  const handleAdd = () => {
    setEditingAdmin(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: AdminItem) => {
    setEditingAdmin(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条记录吗？',
      onOk: async () => {
        const res = await deleteAdmin(id);
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
      if (editingAdmin) {
        const res = await updateAdmin(editingAdmin.id, values);
        if (res.success) {
          message.success('更新成功');
          setModalVisible(false);
          actionRef.current?.reload();
        } else {
          message.error(res.message || '更新失败');
        }
      } else {
        const res = await createAdmin(values);
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

  const columns: ProColumns<AdminItem>[] = [
    {
      title: '管理员ID',
      dataIndex: 'id',
      key: 'list-id',
      search: false,
      sorter: true,
    },
    {
      title: 'Name',
      dataIndex: 'role_name',
      key: 'list-role_name',
      search: false,
      sorter: true,
    },
    {
      title: '用户名',
      dataIndex: 'username',
      valueType: 'text',
      fieldProps: {
        allowClear: true,
        placeholder: '请输入用户名',
      },
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      valueType: 'text',
      fieldProps: {
        allowClear: true,
        placeholder: '请输入手机号',
      },
    },
    {
      title: '角色ID',
      dataIndex: 'role_id',
      valueType: 'select',
      fieldProps: {
        options: selectOptions['role_id'] || [],
        onChange: () => actionRef.current?.reload(),
        allowClear: true,
        placeholder: '请选择角色ID',
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
      <ProTable<AdminItem>
        headerTitle="Admin"
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

          const res = await queryAdminList({
            current: params.current,
            pageSize: pageSize,
            username: params.username,
            phone: params.phone,
            role_id: params.role_id,
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
        title={editingAdmin ? '编辑Admin' : '新建Admin'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={500}
      >
        <Form form={form} layout="vertical">
        <Form.Item
          name="username"
          label="用户名"
          rules={[{ required: undefined, message: '请输入用户名' }]}
        >
          <Input placeholder="请输入用户名" />
        </Form.Item>

        <Form.Item
          name="password"
          label="密码"
          rules={[{ required: true, message: '请输入密码' }]}
        >
          <Input.Password placeholder="请输入密码" />
        </Form.Item>

        <Form.Item
          name="phone"
          label="手机号"
          rules={[{ required: undefined, message: '请输入手机号' }]}
        >
          <Input placeholder="请输入手机号" />
        </Form.Item>

        <Form.Item
          name="role_id"
          label="角色ID"
          rules={[{ required: undefined, message: '请选择角色ID' }]}
        >
          <Select
            placeholder="请选择角色ID"
            options={selectOptions['role_id'] || []}
          />
        </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminList;
