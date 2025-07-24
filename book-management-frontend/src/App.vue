<template>
  <div class="min-h-screen bg-gray-100 font-roboto flex flex-col">
    <nav class="bg-c3 text-c1 p-4 flex justify-between items-center">
      <h1 class="text-xl font-extrabold"><i class="fa-solid fa-book px-2"></i>Quản lý Mượn Sách</h1>
      <div class="flex items-center space-x-4">
        <router-link to="/" class="hover:underline">Trang chủ</router-link>
        <template v-if="isAuthenticated">
          <router-link to="/books" class="hover:underline">Sách</router-link>
          <router-link to="/borrows" class="hover:underline">Mượn sách</router-link>
          <template v-if="!isStaff">
            <router-link to="/reservations" class="hover:underline">Đặt sách</router-link>
          </template>
          <template v-if="isStaff">
            <router-link to="/readers" class="hover:underline">Độc giả</router-link>
            <router-link to="/publishers" class="hover:underline">Nhà xuất bản</router-link>
          </template>
          <template v-if="isAdmin">
            <router-link to="/staff" class="hover:underline">Nhân viên</router-link>
          </template>

          <!-- User Dropdown -->
          <div class="relative" @click="toggleUserMenu" v-click-outside="closeUserMenu">
            <button class="flex items-center space-x-2 text-white hover:text-gray-200">
              <i class="fas fa-user-circle text-xl"></i>
              <span class="font-medium">{{ userName }}</span>
              <i class="fas fa-chevron-down text-sm"></i>
            </button>

            <!-- Dropdown Menu -->
            <div
              v-if="showUserMenu"
              class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10"
            >
              <div class="px-4 py-2 text-sm text-gray-700 border-b">
                <div class="font-medium">{{ userName }}</div>
                <div class="text-xs text-gray-500">
                  {{ userRole === 'reader' ? userInfo.MaDocGia : userInfo.MSNV }}
                </div>
              </div>
              <router-link
                to="/profile"
                class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <i class="fas fa-user-cog mr-2"></i>Thông tin cá nhân
              </router-link>
              <button
                @click="handleLogout"
                class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
              >
                <i class="fas fa-sign-out-alt mr-2"></i>Đăng xuất
              </button>
            </div>
          </div>
        </template>

        <router-link v-else to="/login" class="hover:underline">Đăng nhập</router-link>
      </div>
    </nav>

    <div class="flex-grow">
      <router-view />
    </div>

    <footer class="text-white text-center bg-c3 h-60 flex justify-center items-center">
      <p>© 2025 - Quản lý mượn sách</p>
    </footer>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

export default {
  directives: {
    'click-outside': {
      beforeMount(el, binding) {
        el.clickOutsideEvent = function (event) {
          if (!(el === event.target || el.contains(event.target))) {
            binding.value(event)
          }
        }
        document.addEventListener('click', el.clickOutsideEvent)
      },
      unmounted(el) {
        document.removeEventListener('click', el.clickOutsideEvent)
      },
    },
  },
  setup() {
    const store = useStore()
    const router = useRouter()
    const showUserMenu = ref(false)

    const isAuthenticated = computed(() => {
      return !!store.state.auth?.token
    })

    const userInfo = computed(() => {
      return store.state.auth?.user || {}
    })

    const userName = computed(() => {
      const user = userInfo.value
      return user.HoTen || user.HoTenNV || 'Người dùng'
    })

    const userRole = computed(() => {
      return store.state.auth?.role || ''
    })

    const isAdmin = computed(() => {
      return store.getters['auth/isAdmin']
    })

    const isStaff = computed(() => {
      return store.getters['auth/isStaff']
    })

    const toggleUserMenu = () => {
      showUserMenu.value = !showUserMenu.value
    }

    const closeUserMenu = () => {
      showUserMenu.value = false
    }

    const handleLogout = async () => {
      await store.dispatch('auth/logout')
      // Đóng menu dropdown
      showUserMenu.value = false
      // Chuyển hướng về trang login
      await router.push('/login')
    }

    return {
      isAuthenticated,
      userInfo,
      userName,
      userRole,
      isAdmin,
      isStaff,
      showUserMenu,
      toggleUserMenu,
      closeUserMenu,
      handleLogout,
    }
  },
}
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition:
    transform 0.2s ease,
    opacity 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}
</style>
