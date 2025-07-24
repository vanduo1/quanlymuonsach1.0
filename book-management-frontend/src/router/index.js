import { createRouter, createWebHistory } from 'vue-router'
import store from '../store'

const routes = [
  {
    path: '/',
    redirect: '/books',
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { requiresGuest: true },
  },
  {
    path: '/books',
    name: 'Books',
    component: () => import('../views/Books.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/borrows',
    name: 'Borrows',
    component: () => import('../views/Borrows.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/reservations',
    name: 'Reservations',
    component: () => import('../views/Reservations.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/readers',
    name: 'Readers',
    component: () => import('../views/Readers.vue'),
    meta: { requiresAuth: true, requiresStaff: true },
  },
  {
    path: '/staff',
    name: 'Staff',
    component: () => import('../views/Staff.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/publishers',
    name: 'Publishers',
    component: () => import('../views/Publishers.vue'),
    meta: { requiresAuth: true, requiresStaff: true },
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/Profile.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/books',
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to, from, next) => {
  const isAuthenticated = store.getters['auth/isAuthenticated']
  const isAdmin = store.getters['auth/isAdmin']
  const isStaff = store.getters['auth/isStaff']

  // Kiểm tra nếu route yêu cầu khách (chưa đăng nhập)
  if (to.meta.requiresGuest && isAuthenticated) {
    return next('/books')
  }

  // Kiểm tra nếu route yêu cầu xác thực
  if (to.meta.requiresAuth && !isAuthenticated) {
    return next('/login')
  }

  // Kiểm tra nếu route yêu cầu quyền admin
  if (to.meta.requiresAdmin && !isAdmin) {
    return next('/books')
  }

  // Kiểm tra nếu route yêu cầu quyền nhân viên
  if (to.meta.requiresStaff && !isStaff) {
    return next('/books')
  }

  next()
})

export default router
