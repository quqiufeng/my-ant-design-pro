<?php

use CodeIgniter\Router\RouteCollection;

/**
 * System Routes
 */
$routes->get('/', 'Api::index');

$routes->group('api', function($routes) {
    $routes->get('list', 'Api::list');
    $routes->get('menus', 'Api::menus');
    $routes->post('login/account', 'Api::accountLogin');
    $routes->post('login/outLogin', 'Api::outLogin');
    $routes->get('currentUser', 'Api::currentUser');
    $routes->post('addUser', 'Api::addUser');
    $routes->post('loginOut', 'Api::loginOut');

    // admin 路由配置 (添加到 Config/Routes.php)
    $routes->get('admin', 'AdminController::list');
    $routes->get('admin/(:num)', 'AdminController::detail/$1');
    $routes->post('admin', 'AdminController::create');
    $routes->put('admin/(:num)', 'AdminController::update/$1');
    $routes->delete('admin/(:num)', 'AdminController::delete/$1');

    //新增的路由
    // role 路由配置 (添加到 Config/Routes.php)
    $routes->get('role', 'RoleController::list');
    $routes->get('role/(:num)', 'RoleController::detail/$1');
    $routes->post('role', 'RoleController::create');
    $routes->put('role/(:num)', 'RoleController::update/$1');
    $routes->delete('role/(:num)', 'RoleController::delete/$1');



});
