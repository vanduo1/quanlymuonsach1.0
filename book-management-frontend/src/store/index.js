import { createStore } from 'vuex'
import axiosInstance from '../utils/axiosInstance'

// Lấy thông tin từ localStorage nếu có
const token = localStorage.getItem('token')
let user = null
try {
  const userData = localStorage.getItem('user')
  user = userData ? JSON.parse(userData) : null
} catch (error) {
  console.error('Error parsing user data from localStorage:', error)
  localStorage.removeItem('user')
}
const role = localStorage.getItem('role')

// Khởi tạo axios với token nếu có
if (token) {
  axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

export default createStore({
  state: {
    auth: {
      token: token || null,
      user: user || null,
      role: role || null,
    },
  },
  mutations: {
    'auth/setToken'(state, token) {
      state.auth.token = token
      if (token) {
        localStorage.setItem('token', token)
        // Cập nhật token cho axios instance
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`
      } else {
        localStorage.removeItem('token')
        delete axiosInstance.defaults.headers.common['Authorization']
      }
    },
    'auth/setUser'(state, user) {
      state.auth.user = user
      if (user) {
        localStorage.setItem('user', JSON.stringify(user))
      } else {
        localStorage.removeItem('user')
      }
    },
    'auth/setRole'(state, role) {
      state.auth.role = role
      if (role) {
        localStorage.setItem('role', role)
      } else {
        localStorage.removeItem('role')
      }
    },
    'auth/logout'(state) {
      state.auth.token = null
      state.auth.user = null
      state.auth.role = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('role')
      delete axiosInstance.defaults.headers.common['Authorization']
    },
  },
  actions: {
    'auth/login'({ commit }, { user, token }) {
      commit('auth/setUser', user)
      commit('auth/setToken', token)
      commit('auth/setRole', user.role)
    },
    'auth/logout'({ commit }) {
      commit('auth/logout')
    },
    'auth/checkAuth'({ state, commit }) {
      const token = state.auth.token
      if (token) {
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`
      }
      return !!token
    },
  },
  getters: {
    'auth/isAuthenticated': (state) => !!state.auth.token,
    'auth/user': (state) => state.auth.user,
    'auth/role': (state) => state.auth.role,
    'auth/isAdmin': (state) => state.auth.role === 'admin',
    'auth/isLibrarian': (state) => state.auth.role === 'librarian',
    'auth/isReader': (state) => state.auth.role === 'reader',
    'auth/isStaff': (state) => ['admin', 'librarian'].includes(state.auth.role),
  },
})
