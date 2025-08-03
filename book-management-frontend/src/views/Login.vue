<!-- Login.vue -->
<template>
  <div class="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
        {{ isLoginMode ? 'Đăng nhập' : 'Đăng ký tài khoản' }}
      </h2>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <!-- Toggle Login/Register -->
        <div v-if="!isStaffLogin" class="mb-6 flex justify-center">
          <button
            type="button"
            class="text-sm font-medium text-indigo-600 hover:text-indigo-500"
            @click="toggleMode"
          >
            {{ isLoginMode ? 'Chưa có tài khoản? Đăng ký ngay' : 'Đã có tài khoản? Đăng nhập' }}
          </button>
        </div>

        <!-- Toggle Staff/Reader -->
        <div v-if="isLoginMode" class="mb-6">
          <div class="flex justify-center space-x-4">
            <button
              type="button"
              :class="[
                'px-4 py-2 rounded-md',
                isStaffLogin ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700',
              ]"
              @click="switchToStaff"
            >
              Nhân viên
            </button>
            <button
              type="button"
              :class="[
                'px-4 py-2 rounded-md',
                !isStaffLogin ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700',
              ]"
              @click="switchToReader"
            >
              Độc giả
            </button>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="errorMessage" class="mb-4 text-red-600 text-sm text-center">
          {{ errorMessage }}
        </div>

        <!-- Login Form -->
        <form v-if="isLoginMode" class="space-y-6" @submit.prevent="handleLogin">
          <div>
            <label class="block text-sm font-medium text-gray-700">
              {{ isStaffLogin ? 'Mã số nhân viên' : 'Mã độc giả' }}
            </label>
            <div class="mt-1">
              <input
                v-model="loginForm.username"
                :placeholder="isStaffLogin ? 'Nhập mã số nhân viên' : 'Nhập mã độc giả'"
                required
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700"> Mật khẩu </label>
            <div class="mt-1">
              <input
                type="password"
                v-model="loginForm.password"
                required
                placeholder="Nhập mật khẩu"
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Đăng nhập
            </button>
          </div>
        </form>

        <!-- Registration Form -->
        <form v-else class="space-y-6" @submit.prevent="handleRegister">
          <div>
            <label class="block text-sm font-medium text-gray-700">Họ và tên</label>
            <div class="mt-1">
              <input
                v-model="registerForm.HoTen"
                required
                placeholder="Nhập họ và tên"
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Email</label>
            <div class="mt-1">
              <input
                type="text"
                v-model="registerForm.Email"
                required
                placeholder="Nhập địa chỉ email"
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Mật khẩu</label>
            <div class="mt-1">
              <input
                type="password"
                v-model="registerForm.MatKhau"
                required
                placeholder="Nhập mật khẩu"
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Số điện thoại</label>
            <div class="mt-1">
              <input
                type="tel"
                v-model="registerForm.SoDienThoai"
                required
                placeholder="Nhập số điện thoại"
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Địa chỉ</label>
            <div class="mt-1">
              <input
                type="text"
                v-model="registerForm.DiaChi"
                required
                placeholder="Nhập địa chỉ"
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Ngày sinh</label>
            <div class="mt-1">
              <input
                type="date"
                v-model="registerForm.NgaySinh"
                required
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Đăng ký
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../utils/axiosInstance'
import { useStore } from 'vuex'

export default {
  name: 'Login',
  setup() {
    const router = useRouter()
    const store = useStore()
    const isLoginMode = ref(true)
    const isStaffLogin = ref(false)
    const errorMessage = ref('')
    const loginForm = ref({
      username: '',
      password: '',
    })
    const registerForm = ref({
      HoTen: '',
      Email: '',
      MatKhau: '',
      SoDienThoai: '',
      DiaChi: '',
      NgaySinh: '',
    })

    const clearError = () => {
      errorMessage.value = ''
    }

    const switchToStaff = () => {
      isStaffLogin.value = true
      clearError()
      loginForm.value = { username: '', password: '' }
    }

    const switchToReader = () => {
      isStaffLogin.value = false
      clearError()
      loginForm.value = { username: '', password: '' }
    }

    const toggleMode = () => {
      isLoginMode.value = !isLoginMode.value
      clearError()
      if (isLoginMode.value) {
        loginForm.value = { username: '', password: '' }
      } else {
        registerForm.value = {
          HoTen: '',
          Email: '',
          MatKhau: '',
          SoDienThoai: '',
          DiaChi: '',
          NgaySinh: '',
        }
      }
    }

    const handleRegister = async () => {
      try {
        clearError()
        const response = await axios.post('/docgia/register', registerForm.value)
        alert('Đăng ký thành công! Mã độc giả của bạn là: ' + response.data.MaDocGia)
        // Chuyển sang form đăng nhập và điền sẵn mã độc giả
        isLoginMode.value = true
        loginForm.value.username = response.data.MaDocGia
      } catch (error) {
        console.error('Registration error:', error)
        errorMessage.value = error.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.'
      }
    }

    const handleLogin = async () => {
      try {
        clearError()
        // SỬ DỤNG ENDPOINT AN TOÀN
        const endpoint = isStaffLogin.value ? '/login/staff' : '/login/reader'

        // Chuẩn bị dữ liệu gửi đi
        const requestData = isStaffLogin.value
          ? {
              MSNV: loginForm.value.username,
              MatKhau: loginForm.value.password,
            }
          : {
              MaDocGia: loginForm.value.username,
              MatKhau: loginForm.value.password,
            }

        console.log('Login request:', {
          endpoint,
          data: { ...requestData, MatKhau: '***' },
        })

        const response = await api.post(endpoint, requestData)
        console.log('Login response:', response.data)

        // Lưu thông tin user và token
        store.dispatch('auth/login', {
          user: response.data.user,
          token: response.data.token,
        })

        // Chuyển hướng về trang chủ
        router.push('/')
      } catch (error) {
        console.error('Login error:', error)
        errorMessage.value =
          error.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.'
      }
    }

    return {
      isLoginMode,
      isStaffLogin,
      loginForm,
      registerForm,
      errorMessage,
      handleLogin,
      handleRegister,
      switchToStaff,
      switchToReader,
      toggleMode,
    }
  },
}
</script>

<style>
.error-message {
  color: #dc2626;
  margin-bottom: 1rem;
  font-size: 0.875rem;
}
</style>
