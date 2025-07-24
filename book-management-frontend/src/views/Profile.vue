<template>
  <div class="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
    <div class="bg-white shadow rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Thông tin cá nhân</h3>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Thông tin cơ bản -->
          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label class="block text-sm font-medium text-gray-700">
                {{ isReader ? 'Mã độc giả' : 'Mã số nhân viên' }}
              </label>
              <div class="mt-1">
                <input
                  :value="isReader ? userInfo.MaDocGia : userInfo.MSNV"
                  disabled
                  class="bg-gray-100 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-700 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700"> Họ và tên </label>
              <div class="mt-1">
                <input
                  v-model="form.fullName"
                  required
                  class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700"> Email </label>
              <div class="mt-1">
                <input
                  type="email"
                  v-model="form.email"
                  required
                  class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700"> Số điện thoại </label>
              <div class="mt-1">
                <input
                  type="tel"
                  v-model="form.phone"
                  required
                  class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700"> Địa chỉ </label>
              <div class="mt-1">
                <input
                  v-model="form.address"
                  required
                  class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          <!-- Đổi mật khẩu -->
          <div class="mt-6 pt-6 border-t border-gray-200">
            <h4 class="text-md font-medium text-gray-900 mb-4">Đổi mật khẩu</h4>
            <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label class="block text-sm font-medium text-gray-700"> Mật khẩu hiện tại </label>
                <div class="mt-1">
                  <input
                    type="password"
                    v-model="form.currentPassword"
                    class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700"> Mật khẩu mới </label>
                <div class="mt-1">
                  <input
                    type="password"
                    v-model="form.newPassword"
                    class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="flex justify-end space-x-3">
            <button
              type="button"
              class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              @click="resetForm"
            >
              Hủy
            </button>
            <button
              type="submit"
              class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import axiosInstance from '../utils/axiosInstance'

export default {
  name: 'Profile',
  setup() {
    const store = useStore()
    const userInfo = computed(() => store.getters['auth/user'])
    const userRole = computed(() => store.getters['auth/role'])
    const isReader = computed(() => userRole.value === 'reader')

    const form = ref({
      fullName: '',
      email: '',
      phone: '',
      address: '',
      currentPassword: '',
      newPassword: '',
    })

    const loadUserInfo = async () => {
      try {
        const endpoint = isReader.value ? '/docgia' : '/nhanvien'
        const userId = isReader.value ? userInfo.value.MaDocGia : userInfo.value.MSNV
        const response = await axiosInstance.get(`${endpoint}/${userId}`)
        const data = response.data

        form.value = {
          fullName: data.HoTen || data.HoTenNV,
          email: data.Email,
          phone: data.SoDienThoai,
          address: data.DiaChi,
          currentPassword: '',
          newPassword: '',
        }
      } catch (error) {
        console.error('Lỗi tải thông tin:', error)
        alert('Không thể tải thông tin người dùng!')
      }
    }

    const handleSubmit = async () => {
      try {
        const endpoint = isReader.value ? '/docgia' : '/nhanvien'
        const payload = isReader.value
          ? {
              HoTen: form.value.fullName,
              Email: form.value.email,
              SoDienThoai: form.value.phone,
              DiaChi: form.value.address,
            }
          : {
              HoTenNV: form.value.fullName,
              Email: form.value.email,
              SoDienThoai: form.value.phone,
              DiaChi: form.value.address,
            }

        if (form.value.currentPassword && form.value.newPassword) {
          payload.CurrentPassword = form.value.currentPassword
          payload.NewPassword = form.value.newPassword
        }

        const userId = isReader.value ? userInfo.value.MaDocGia : userInfo.value.MSNV
        await axiosInstance.put(`${endpoint}/${userId}`, payload)
        alert('Cập nhật thông tin thành công!')

        // Cập nhật thông tin trong store
        const updatedUserInfo = {
          ...userInfo.value,
          Email: form.value.email,
        }

        if (isReader.value) {
          updatedUserInfo.HoTen = form.value.fullName
        } else {
          updatedUserInfo.HoTenNV = form.value.fullName
        }

        store.commit('auth/setUser', updatedUserInfo)

        // Reset mật khẩu fields
        form.value.currentPassword = ''
        form.value.newPassword = ''
      } catch (error) {
        console.error('Lỗi cập nhật:', error)
        alert(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật thông tin!')
      }
    }

    const resetForm = () => {
      loadUserInfo()
    }

    onMounted(() => {
      loadUserInfo()
    })

    return {
      form,
      userInfo,
      isReader,
      handleSubmit,
      resetForm,
    }
  },
}
</script>
