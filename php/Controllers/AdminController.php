<?php

namespace App\Controllers;

/**
 * Admin Controller
 * Admin 管理 API
 *
 * LEFT JOIN 关联字段语法:
 *   "left join {表名} on {本表字段}={关联表字段} display {显示字段} as {别名}"
 *
 * 示例: "left join role on role_id=id display name as role_name"
 */
class AdminController extends \CodeIgniter\Controller
{
    public function index()
    {
        return $this->response->setJSON([
            'status' => 200,
            'message' => 'Admin API',
        ]);
    }

    /**
     * 获取Admin列表
     * 列表查询支持分页、搜索、排序
     *
     * 支持 LEFT JOIN 关联查询:
     *   配置: "left join role on role_id=id display name as role_name"
     *   生成: SELECT *, role.name as role_name FROM admin
     *         LEFT JOIN role ON role.id = admin.role_id
     */
    public function list()
    {
        $page = (int) ($this->request->getGet('current') ?? $this->request->getGet('page') ?? 1);
        $pageSize = (int) ($this->request->getGet('pageSize') ?? 20);
        $username = $this->request->getGet('username');
        $phone = $this->request->getGet('phone');
        $role_id = $this->request->getGet('role_id');
        $sorter = $this->request->getGet('sorter');
        $order = $this->request->getGet('order');

        $db = \Config\Database::connect();
        $builder = $db->table('admin');

        // SELECT 字段（包含 LEFT JOIN 别名字段）
        $builder->select('admin.id, admin.username, admin.phone, admin.role_id, role.name as role_name');

        $builder->join('role', 'role.id = admin.role_id', 'left');

        if (!empty($username)) {
            $builder->like('admin.username', $username);
        }

        if (!empty($phone)) {
            $builder->like('admin.phone', $phone);
        }

        if (!empty($role_id)) {
            $builder->where('admin.role_id', $role_id);
        }

        $total = $builder->countAllResults(false);

        if (!empty($sorter) && !empty($order)) {
            $orderDirection = $order === 'ascend' ? 'ASC' : 'DESC';
            $builder->orderBy($sorter, $orderDirection);
        } else {
            $builder->orderBy('id', 'DESC');
        }

        $builder->limit($pageSize, ($page - 1) * $pageSize);
        $admin = $builder->get()->getResultArray();

        return $this->response->setJSON([
            'success' => true,
            'data' => $admin,
            'total' => $total,
            'page' => $page,
            'pageSize' => $pageSize,
        ]);
    }

    /**
     * 获取Admin详情
     */
    public function detail($id)
    {
        $db = \Config\Database::connect();
        $builder = $db->table('admin');
        $builder->where('id', $id);
        $admin = $builder->get()->getRowArray();

        if (!$admin) {
            return $this->response->setJSON([
                'success' => false,
                'message' => 'Admin不存在',
            ])->setStatusCode(404);
        }

        return $this->response->setJSON([
            'success' => true,
            'data' => $admin,
        ]);
    }

    /**
     * 创建Admin
     * 注意：获取表单数据时需同时支持 JSON 和 form-data 格式
     */
    public function create()
    {
        $json = $this->request->getJSON(true);
        $username = $json['username'] ?? $this->request->getPost('username');
        $password = $json['password'] ?? $this->request->getPost('password');
        $phone = $json['phone'] ?? $this->request->getPost('phone');
        $role_id = $json['role_id'] ?? $this->request->getPost('role_id');

        // 验证必填字段
        if (empty($password)) {
            return $this->response->setJSON([
                'success' => false,
                'message' => '密码不能为空',
            ])->setStatusCode(400);
        }

        $db = \Config\Database::connect();

        // 检查重复
        $builder = $db->table('admin');
        $builder->where('username', $username);
        $builder->where('phone', $phone);
        $builder->where('role_id', $role_id);
        if ($builder->countAllResults(false) > 0) {
            return $this->response->setJSON([
                'success' => false,
                'message' => '记录已存在',
            ])->setStatusCode(400);
        }

        $db->table('admin')->insert([
            'username' => $username,
            'password' => password_hash($password, PASSWORD_DEFAULT),
            'phone' => $phone,
            'role_id' => $role_id,
        ]);

        return $this->response->setJSON([
            'success' => true,
            'message' => '创建成功',
        ]);
    }

    /**
     * 更新Admin
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
        $username = $json['username'] ?? $this->request->getPost('username');
        $password = $json['password'] ?? $this->request->getPost('password');
        $phone = $json['phone'] ?? $this->request->getPost('phone');
        $role_id = $json['role_id'] ?? $this->request->getPost('role_id');

        $db = \Config\Database::connect();

        // 检查是否存在
        $builder = $db->table('admin');
        $builder->where('id', $id);
        if (!$builder->get()->getRowArray()) {
            return $this->response->setJSON([
                'success' => false,
                'message' => 'Admin不存在',
            ])->setStatusCode(404);
        }

        $db->table('admin')->where('id', $id)->update([
            'username' => $username,
        ]);

        if (!empty($password)) {
            $db->table('admin')->where('id', $id)->update([
                'password' => password_hash($password, PASSWORD_DEFAULT),
            ]);
        }

        $db->table('admin')->where('id', $id)->update([
            'phone' => $phone,
        ]);

        $db->table('admin')->where('id', $id)->update([
            'role_id' => $role_id,
        ]);

        return $this->response->setJSON([
            'success' => true,
            'message' => '更新成功',
        ]);
    }

    /**
     * 删除Admin
     */
    public function delete($id)
    {
        if ($id == 1) {
            return $this->response->setJSON([
                'success' => false,
                'message' => '系统记录不能删除',
            ])->setStatusCode(403);
        }

        $db = \Config\Database::connect();

        $builder = $db->table('admin');
        $builder->where('id', $id);
        $admin = $builder->get()->getRowArray();

        if (!$admin) {
            return $this->response->setJSON([
                'success' => false,
                'message' => 'Admin不存在',
            ])->setStatusCode(404);
        }

        $db->table('admin')->where('id', $id)->delete();

        return $this->response->setJSON([
            'success' => true,
            'message' => '删除成功',
        ]);
    }
}
