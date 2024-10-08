import { createRouter, createWebHistory } from 'vue-router'
import Home from './views/Home.vue'
import Login from './views/Login.vue'
import Logout from './views/Logout.vue'

import View401 from './views/401View.vue'
import View403 from './views/403View.vue'
import View404 from './views/404View.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    //meta: { requiresAuth: true } // 需要登入後才能訪問
  },
  {
    path: '/home',
    name: 'Home',
    component: Home,
    //meta: { requiresAuth: true } // 需要登入後才能訪問
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/Logout',
    name: 'Logout',
    component: Logout
  },
  {
    path: '/401',
    name: '401',
    component: View401
  },
  {
    path: '/403',
    name: '403',
    component: View403
  },
  {
    path: '/404',
    name: '404',
    component: View404
  }
]

const router = createRouter({
  history: createWebHistory('/anaview/'), // 基於 /anaview/ 來生成歷史記錄路徑
  routes
})

// 路由守衛：檢查是否已登入
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true'
  
  if (to.matched.some(record => record.meta.requiresAuth) && !isAuthenticated) {
    next('/login') // 如果未登入，跳轉到登入頁面
  } else {
    next() // 已登入，允許訪問
  }
})

export default router