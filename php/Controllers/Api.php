<?php

namespace App\Controllers;

use CodeIgniter\Controller;

/*
 * API 控制器
 *
 * 重要提示：
 * - 获取表单数据时需同时支持 JSON 和 form-data 格式
 * - 使用 $this->request->getJSON(true) 获取 JSON 数据
 * - 使用 $this->request->getPost('field') 获取 POST 数据
 * - 建议写法：$json = $this->request->getJSON(true); $value = $json['field'] ?? $this->request->getPost('field');
 */

class Api extends Controller
{
    public function index()
    {
        return $this->response->setJSON([
            'status'  => 200,
            'message' => 'API is working',
        ]);
    }

    public function list()
    {
        return $this->response->setJSON([
            'status'  => 200,
            'message' => 'List of items',
            'data'    => [
                ['id' => 1, 'name' => 'Item 1'],
            ]
        ]);
    }

    public function accountLogin()
    {
        $username = $this->request->getPost('username');
        $password = $this->request->getPost('password');

        if ($username === 'admin' && $password === 'admin') {
            return $this->response->setJSON([
                'status' => 'ok',
                'type' => 'account',
                'currentAuthority' => 'admin',
            ]);
        }

        return $this->response->setJSON([
            'status' => 'error',
            'type' => 'account',
            'currentAuthority' => 'guest',
        ])->setStatusCode(401);
    }

    public function loginAccount()
    {
        $username = $this->request->getPost('username');
        $password = $this->request->getPost('password');

        if ($username === 'admin' && $password === 'admin') {
            return $this->response->setJSON([
                'status' => 'ok',
                'type' => 'account',
                'currentAuthority' => 'admin',
            ]);
        }

        return $this->response->setJSON([
            'status' => 'error',
            'type' => 'account',
            'currentAuthority' => 'guest',
        ])->setStatusCode(401);
    }

    public function currentUser()
    {
        $token = $this->request->getGet('token');
        
        if (empty($token)) {
            return $this->response->setJSON([
                'success' => false,
                'message' => '未登录',
            ])->setStatusCode(401);
        }

        $db = \Config\Database::connect();
        $builder = $db->table('admin');
        $builder->select('admin.*, role.name as role_name');
        $builder->join('role', 'role.id = admin.role_id');
        $builder->where('admin.id', $token);
        $user = $builder->get()->getRowArray();

        if (!$user) {
            return $this->response->setJSON([
                'success' => false,
                'message' => '用户不存在',
            ])->setStatusCode(401);
        }

        return $this->response->setJSON([
            'success' => true,
            'data' => [
                'name' => $user['username'],
                'avatar' => 'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png',
                'userid' => str_pad($user['id'], 8, '0', STR_PAD_LEFT),
                'email' => $user['phone'] . '@example.com',
                'signature' => '海纳百川，有容乃大',
                'title' => $user['role_name'],
                'group' => '技术部',
                'tags' => [],
                'notifyCount' => 12,
                'unreadCount' => 12,
                'country' => 'China',
                'access' => 'admin',
            ],
        ]);
    }

    public function outLogin()
    {
        return $this->response->setJSON([
            'data' => (object)[],
            'msg' => '退出成功',
            'status' => 'ok',
        ]);
    }

    public function loginOut()
    {
        $token = $this->request->getPost('token');
        
        if (!empty($token)) {
            $db = \Config\Database::connect();
            $db->table('admin')->where('id', $token)->update(['login_time' => date('Y-m-d H:i:s')]);
        }

        return $this->response->setJSON([
            'success' => true,
            'message' => '退出成功',
        ]);
    }

    public function menus()
    {
        // 从数据库获取菜单
        $db = \Config\Database::connect();
        $builder = $db->table('system_menu');
        $builder->where('status', 1);
        $builder->where('is_visible', 1);
        $builder->orderBy('sort', 'ASC');
        $menus = $builder->get()->getResultArray();

        $routes = $this->buildRoutes($menus);

        return $this->response->setJSON([
            'success' => true,
            'status' => 200,
            'message' => 'success',
            'data' => $routes
        ]);
    }

    public function addUser()
    {
        $username = $this->request->getPost('username');
        $phone = $this->request->getPost('phone');
        $password = $this->request->getPost('password');
        $roleId = $this->request->getPost('role_id') ?? 1;

        if (empty($username) || empty($password)) {
            return $this->response->setJSON([
                'success' => false,
                'message' => '用户名和密码不能为空',
            ])->setStatusCode(400);
        }

        $db = \Config\Database::connect();
        
        // 检查用户是否已存在
        $builder = $db->table('admin');
        $builder->where('username', $username);
        if ($builder->countAllResults(false) > 0) {
            return $this->response->setJSON([
                'success' => false,
                'message' => '用户已存在',
            ])->setStatusCode(400);
        }

        // 插入用户
        $db->table('admin')->insert([
            'username' => $username,
            'phone' => $phone,
            'password' => password_hash($password, PASSWORD_DEFAULT),
            'role_id' => $roleId,
            'login_time' => null,
        ]);

        return $this->response->setJSON([
            'success' => true,
            'message' => '用户创建成功',
        ]);
    }

    private function buildRoutes(array $menus): array
    {
        $map = [];
        foreach ($menus as $menu) {
            $path = $menu['path'];
            $level = substr_count($path, '/') - 1;
            
            $map[$path] = [
                'path' => $path,
                'name' => $menu['name'],
                'title' => $menu['title'],
                'icon' => $menu['icon'],
                'component' => $level > 0 ? '.' . $path : '',
                'redirect' => $menu['redirect'] ?? '',
                'keepAlive' => true, // 支持标签页缓存
                'children' => []
            ];
        }

        foreach ($menus as $menu) {
            $path = $menu['path'];
            $level = substr_count($path, '/') - 1;

            if ($level > 0) {
                $parts = explode('/', trim($path, '/'));
                array_pop($parts);
                $parentPath = '/' . implode('/', $parts);

                if (isset($map[$parentPath])) {
                    $map[$parentPath]['children'][] = $map[$path];
                }
            }
        }

        $convert = function($node) use (&$convert) {
            $route = [
                'path' => $node['path'],
                'name' => $node['name'],
                'title' => $node['title'],
                'icon' => $node['icon'],
                'keepAlive' => true, // 支持标签页缓存
            ];

            if (!empty($node['component'])) {
                $route['component'] = $node['component'];
            }

            if (!empty($node['redirect'])) {
                $route['redirect'] = $node['redirect'];
            }

            if (!empty($node['children'])) {
                $route['routes'] = array_map($convert, $node['children']);
            }

            return $route;
        };

        $rootMenus = array_filter($menus, function($menu) {
            return substr_count($menu['path'], '/') === 1;
        });

        $result = [];
        foreach ($rootMenus as $menu) {
            if (isset($map[$menu['path']])) {
                $result[] = $convert($map[$menu['path']]);
            }
        }

        return $result;
    }
}
