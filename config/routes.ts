/**
 * @name 自动生成的路由配置
 * @desc 由 scripts/generate-routes.js 从数据库自动生成
 * @desc 请勿手动修改，此文件会被覆盖
 */

export default [
  // 用户相关页面（不通过数据库管理）
  {
    path: '/user',
    layout: false,
    routes: [
      {
        path: '/user/login',
        layout: false,
        name: 'login',
        component: './user/login',
      },
      {
        path: '/user',
        redirect: '/user/login',
      },
      {
        name: 'register-result',
        icon: 'smile',
        path: '/user/register-result',
        component: './user/register-result',
      },
      {
        name: 'register',
        icon: 'smile',
        path: '/user/register',
        component: './user/register',
      },
      {
        component: '404',
        path: '/user/*',
      },
    ],
  },
  // 从数据库生成的菜单路由
  {
  path: '/dashboard',
  name: 'dashboard',
  displayName: '仪表盘',
  icon: 'dashboard',
  routes: [
    {
      path: '/dashboard/analysis',
      name: 'analysis',
      displayName: '分析页',
      icon: 'smile',
      component: './dashboard/analysis'
    },
    {
      path: '/dashboard/monitor',
      name: 'monitor',
      displayName: '监控页',
      icon: 'smile',
      component: './dashboard/monitor'
    },
    {
      path: '/dashboard/workplace',
      name: 'workplace',
      displayName: '工作台',
      icon: 'smile',
      component: './dashboard/workplace'
    }
    ]
},
  {
  path: '/form',
  name: 'form',
  displayName: '表单页',
  icon: 'form',
  routes: [
    {
      path: '/form/basic-form',
      name: 'basic-form',
      displayName: '基础表单',
      icon: 'smile',
      component: './form/basic-form'
    },
    {
      path: '/form/step-form',
      name: 'step-form',
      displayName: '分步表单',
      icon: 'smile',
      component: './form/step-form'
    },
    {
      path: '/form/advanced-form',
      name: 'advanced-form',
      displayName: '高级表单',
      icon: 'smile',
      component: './form/advanced-form'
    }
    ]
},
  {
  path: '/list',
  name: 'list',
  displayName: '列表页',
  icon: 'table',
  routes: [
    {
      path: '/list/search',
      name: 'search-list',
      displayName: '搜索列表',
      icon: 'smile',
      component: './list/search',
      routes: [
        {
          path: '/list/search/articles',
          name: 'articles',
          displayName: '文章列表',
          icon: 'smile',
          component: './list/search/articles'
        },
        {
          path: '/list/search/projects',
          name: 'projects',
          displayName: '项目列表',
          icon: 'smile',
          component: './list/search/projects'
        },
        {
          path: '/list/search/applications',
          name: 'applications',
          displayName: '应用列表',
          icon: 'smile',
          component: './list/search/applications'
        }
        ]
    },
    {
      path: '/list/table-list',
      name: 'table-list',
      displayName: '查询表格',
      icon: 'smile',
      component: './list/table-list'
    },
    {
      path: '/list/basic-list',
      name: 'basic-list',
      displayName: '标准列表',
      icon: 'smile',
      component: './list/basic-list'
    },
    {
      path: '/list/card-list',
      name: 'card-list',
      displayName: '卡片列表',
      icon: 'smile',
      component: './list/card-list'
    }
    ]
},
  {
  path: '/profile',
  name: 'profile',
  displayName: '详情页',
  icon: 'profile',
  routes: [
    {
      path: '/profile/basic',
      name: 'basic',
      displayName: '基础详情页',
      icon: 'smile',
      component: './profile/basic'
    },
    {
      path: '/profile/advanced',
      name: 'advanced',
      displayName: '高级详情页',
      icon: 'smile',
      component: './profile/advanced'
    }
    ]
},
  {
  path: '/result',
  name: 'result',
  displayName: '结果页',
  icon: 'CheckCircleOutlined',
  routes: [
    {
      path: '/result/success',
      name: 'success',
      displayName: '成功页',
      icon: 'smile',
      component: './result/success'
    },
    {
      path: '/result/fail',
      name: 'fail',
      displayName: '失败页',
      icon: 'smile',
      component: './result/fail'
    }
    ]
},
  {
  path: '/exception',
  name: 'exception',
  displayName: '异常页',
  icon: 'warning',
  routes: [
    {
      path: '/exception/403',
      name: '403',
      displayName: '403',
      icon: 'smile',
      component: './exception/403'
    },
    {
      path: '/exception/404',
      name: '404',
      displayName: '404',
      icon: 'smile',
      component: './exception/404'
    },
    {
      path: '/exception/500',
      name: '500',
      displayName: '500',
      icon: 'smile',
      component: './exception/500'
    }
    ]
},
  {
  path: '/account',
  name: 'account',
  displayName: '个人中心',
  icon: 'user',
  routes: [
    {
      path: '/account/center',
      name: 'account-center',
      displayName: '个人中心',
      icon: 'smile',
      component: './account/center'
    },
    {
      path: '/account/settings',
      name: 'settings',
      displayName: '个人设置',
      icon: 'smile',
      component: './account/settings'
    }
    ]
},
  {
  path: '/admin',
  name: 'admin',
  displayName: '管理员',
  icon: 'user',
  routes: [
    {
      path: '/admin/role',
      name: 'role',
      displayName: '角色管理',
      icon: 'team',
      component: './admin/role'
    },
    {
      path: '/admin/admin-list',
      name: 'admin-list',
      displayName: '管理员列表',
      icon: 'solution',
      component: './admin/admin-list'
    }
    ]
},
  // 默认重定向
  {
    path: '/',
    redirect: '/dashboard/analysis',
  },
  // 404 页面
  {
    component: '404',
    path: '/*',
  },
];
