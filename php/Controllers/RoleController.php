<?php

namespace App\Controllers;

/**
 * Role Controller
 * Role 管理 API
 *
 * LEFT JOIN 关联字段语法:
 *   "left join {表名} on {本表字段}={关联表字段} display {显示字段} as {别名}"
 *
 * 示例: "left join role on role_id=id display name as role_name"
 */
class RoleController extends \CodeIgniter\Controller
{
    public function index()
    {
        return $this->response->setJSON([
            'status' => 200,
            'message' => 'Role API',
        ]);
    }

    /**
     * 获取Role列表
     * 列表查询支持分页、搜索、排序
     *
     * 支持 LEFT JOIN 关联查询:
     *   配置: "left join role on role_id=id display name as role_name"
     *   生成: SELECT *, role.name as role_name FROM role
     *         LEFT JOIN role ON role.id = role.role_id
     */
    public function list()
    {
        $page = (int) ($this->request->getGet('current') ?? $this->request->getGet('page') ?? 1);
        $pageSize = (int) ($this->request->getGet('pageSize') ?? 20);
        $name = $this->request->getGet('name');
        $sorter = $this->request->getGet('sorter');
        $order = $this->request->getGet('order');

        $db = \Config\Database::connect();
        $builder = $db->table('role');

        // SELECT 字段（包含 LEFT JOIN 别名字段）
        $builder->select('role.id, role.name');

        // 无关联表查询

        if (!empty($name)) {
            $builder->like('role.name', $name);
        }

        $total = $builder->countAllResults(false);

        if (!empty($sorter) && !empty($order)) {
            $orderDirection = $order === 'ascend' ? 'ASC' : 'DESC';
            $builder->orderBy($sorter, $orderDirection);
        } else {
            $builder->orderBy('id', 'DESC');
        }

        $builder->limit($pageSize, ($page - 1) * $pageSize);
        $role = $builder->get()->getResultArray();

        return $this->response->setJSON([
            'success' => true,
            'data' => $role,
            'total' => $total,
            'page' => $page,
            'pageSize' => $pageSize,
        ]);
    }

    /**
     * 获取Role详情
     */
    public function detail($id)
    {
        $db = \Config\Database::connect();
        $builder = $db->table('role');
        $builder->where('id', $id);
        $role = $builder->get()->getRowArray();

        if (!$role) {
            return $this->response->setJSON([
                'success' => false,
                'message' => 'Role不存在',
            ])->setStatusCode(404);
        }

        return $this->response->setJSON([
            'success' => true,
            'data' => $role,
        ]);
    }

    /**
     * 创建Role
     * 注意：获取表单数据时需同时支持 JSON 和 form-data 格式
     */
    public function create()
    {
        $json = $this->request->getJSON(true);
        $name = $json['name'] ?? $this->request->getPost('name');

        // 验证必填字段


        $db = \Config\Database::connect();

        // 检查重复
        $builder = $db->table('role');
        $builder->where('name', $name);
        if ($builder->countAllResults(false) > 0) {
            return $this->response->setJSON([
                'success' => false,
                'message' => '记录已存在',
            ])->setStatusCode(400);
        }

        $db->table('role')->insert([
            'name' => $name,
        ]);

        return $this->response->setJSON([
            'success' => true,
            'message' => '创建成功',
        ]);
    }

    /**
     * 更新Role
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
        $name = $json['name'] ?? $this->request->getPost('name');

        $db = \Config\Database::connect();

        // 检查是否存在
        $builder = $db->table('role');
        $builder->where('id', $id);
        if (!$builder->get()->getRowArray()) {
            return $this->response->setJSON([
                'success' => false,
                'message' => 'Role不存在',
            ])->setStatusCode(404);
        }

        $db->table('role')->where('id', $id)->update([
            'name' => $name,
        ]);

        return $this->response->setJSON([
            'success' => true,
            'message' => '更新成功',
        ]);
    }

    /**
     * 删除Role
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

        $builder = $db->table('role');
        $builder->where('id', $id);
        $role = $builder->get()->getRowArray();

        if (!$role) {
            return $this->response->setJSON([
                'success' => false,
                'message' => 'Role不存在',
            ])->setStatusCode(404);
        }

        $db->table('role')->where('id', $id)->delete();

        return $this->response->setJSON([
            'success' => true,
            'message' => '删除成功',
        ]);
    }
}
