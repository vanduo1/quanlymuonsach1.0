<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Quản lý đặt sách</h1>
      <button
        v-if="isStaff"
        @click="openReservationModal()"
        class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Tạo phiếu đặt
      </button>
    </div>

    <!-- Search and Filters -->
    <div class="bg-white shadow rounded-lg p-6 mb-6">
      <div class="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Tìm kiếm</label>
          <input
            type="text"
            v-model="filters.search"
            placeholder="Mã sách, mã độc giả..."
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Trạng thái</label>
          <select
            v-model="filters.trangThai"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="">Tất cả</option>
            <option value="dat_cho">Đặt chỗ</option>
            <option value="cho_duyet">Chờ duyệt</option>
            <option value="da_duyet">Đã duyệt</option>
            <option value="da_huy">Đã hủy</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Từ ngày</label>
          <input
            type="date"
            v-model="filters.tuNgay"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Đến ngày</label>
          <input
            type="date"
            v-model="filters.denNgay"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
      </div>
    </div>

    <!-- Reservations List -->
    <div class="bg-white shadow rounded-lg overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th
              scope="col"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Mã đặt
            </th>
            <th
              scope="col"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Sách
            </th>
            <th
              scope="col"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Độc giả
            </th>
            <th
              scope="col"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Ngày đặt
            </th>
            <th
              scope="col"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Trạng thái
            </th>
            <th scope="col" class="relative px-6 py-3">
              <span class="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="reservation in reservations" :key="reservation.MaDat">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              {{ reservation.MaDat }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ reservation.ThongTinSach?.TenSach }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ reservation.ThongTinDocGia?.HoTen }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ formatDate(reservation.NgayDat) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
              <span
                :class="[
                  'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                  {
                    'bg-blue-100 text-blue-800': reservation.TrangThai === 'dat_cho',
                    'bg-yellow-100 text-yellow-800': reservation.TrangThai === 'cho_duyet',
                    'bg-green-100 text-green-800': reservation.TrangThai === 'da_duyet',
                    'bg-gray-100 text-gray-800': reservation.TrangThai === 'da_huy',
                  },
                ]"
              >
                {{ getTrangThaiText(reservation) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <!-- Actions for Librarian -->
              <template v-if="isStaff">
                <button
                  v-if="reservation.TrangThai === 'cho_duyet'"
                  @click="duyetDatSach(reservation)"
                  class="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-green-100 text-green-700 hover:bg-green-200 mr-2"
                  title="Duyệt yêu cầu đặt sách"
                >
                  ✓ Duyệt
                </button>
                <button
                  v-if="reservation.TrangThai === 'cho_duyet'"
                  @click="tuChoiDatSach(reservation)"
                  class="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 mr-2"
                  title="Từ chối yêu cầu đặt sách"
                >
                  ✗ Từ chối
                </button>
              </template>

              <!-- Actions for Reader -->
              <template
                v-if="
                  !isStaff && ['cho_duyet', 'da_duyet', 'dat_cho'].includes(reservation.TrangThai)
                "
              >
                <button
                  @click="huyDatSach(reservation)"
                  class="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors duration-200"
                  title="Hủy đặt sách này"
                  :disabled="reservation.TrangThai === 'da_huy'"
                >
                  🗑️ Hủy đặt
                </button>
              </template>

              <!-- Show status for cancelled reservations -->
              <span
                v-if="reservation.TrangThai === 'da_huy'"
                class="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-gray-100 text-gray-600"
                title="Phiếu đặt đã bị hủy"
              >
                ❌ Đã hủy
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div
        class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6"
      >
        <div class="flex-1 flex justify-between sm:hidden">
          <button
            @click="changePage(currentPage - 1)"
            :disabled="currentPage === 1"
            class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Previous
          </button>
          <button
            @click="changePage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Next
          </button>
        </div>
        <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-gray-700">
              Hiển thị
              <span class="font-medium">{{ (currentPage - 1) * limit + 1 }}</span>
              đến
              <span class="font-medium">{{ Math.min(currentPage * limit, totalItems) }}</span>
              trong số
              <span class="font-medium">{{ totalItems }}</span>
              kết quả
            </p>
          </div>
          <div>
            <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <button
                v-for="page in displayedPages"
                :key="page"
                @click="changePage(page)"
                :class="[
                  page === currentPage
                    ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50',
                  'relative inline-flex items-center px-4 py-2 border text-sm font-medium',
                ]"
              >
                {{ page }}
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>

    <!-- Reservation Modal -->
    <div v-if="showReservationModal" class="fixed z-10 inset-0 overflow-y-auto">
      <div
        class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0"
      >
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

        <div
          class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
        >
          <form @submit.prevent="saveReservation">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700"> Mã độc giả </label>
                  <input
                    type="text"
                    v-model="reservationForm.MaDocGia"
                    required
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700"> Mã sách </label>
                  <input
                    type="text"
                    v-model="reservationForm.MaSach"
                    required
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>
            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Tạo phiếu đặt
              </button>
              <button
                type="button"
                class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                @click="showReservationModal = false"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useStore } from 'vuex'
import axiosInstance from '../utils/axiosInstance'

export default {
  name: 'Reservations',
  setup() {
    const store = useStore()
    const isStaff = computed(() => store.getters['auth/isStaff'])

    // Data
    const reservations = ref([])
    const totalItems = ref(0)
    const currentPage = ref(1)
    const limit = ref(10)
    const showReservationModal = ref(false)

    const reservationForm = ref({
      MaDocGia: '',
      MaSach: '',
    })

    const filters = ref({
      search: '',
      trangThai: '',
      tuNgay: '',
      denNgay: '',
    })

    // Computed
    const totalPages = computed(() => Math.ceil(totalItems.value / limit.value))
    const displayedPages = computed(() => {
      const pages = []
      let start = Math.max(1, currentPage.value - 2)
      let end = Math.min(totalPages.value, start + 4)

      if (end - start < 4) {
        start = Math.max(1, end - 4)
      }

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      return pages
    })

    // Methods
    const loadReservations = async () => {
      try {
        const params = {
          page: currentPage.value,
          limit: limit.value,
          ...filters.value,
        }

        const response = await axiosInstance.get('/datsach', { params })
        reservations.value = response.data.datSachs
        totalItems.value = response.data.totalCount
      } catch (error) {
        console.error('Lỗi tải danh sách đặt sách:', error)
        alert(error.response?.data?.message || 'Có lỗi xảy ra khi tải danh sách đặt sách!')
      }
    }

    const openReservationModal = () => {
      reservationForm.value = {
        MaDocGia: '',
        MaSach: '',
      }
      showReservationModal.value = true
    }

    const saveReservation = async () => {
      try {
        await axiosInstance.post('/datsach', reservationForm.value)
        alert('Tạo phiếu đặt thành công!')
        showReservationModal.value = false
        loadReservations()
      } catch (error) {
        console.error('Lỗi tạo phiếu đặt:', error)
        alert(error.response?.data?.message || 'Có lỗi xảy ra khi tạo phiếu đặt!')
      }
    }

    const duyetDatSach = async (reservation) => {
      try {
        await axiosInstance.put(`/datsach/${reservation.MaDat}/duyet`)
        alert('Duyệt yêu cầu đặt sách thành công!')
        loadReservations()
      } catch (error) {
        console.error('Lỗi duyệt đặt sách:', error)
        alert(error.response?.data?.message || 'Có lỗi xảy ra khi duyệt đặt sách!')
      }
    }

    const tuChoiDatSach = async (reservation) => {
      try {
        const lyDo = prompt('Nhập lý do từ chối:')
        if (lyDo === null) return

        await axiosInstance.put(`/datsach/${reservation.MaDat}/tu-choi`, { lyDo })
        alert('Từ chối yêu cầu đặt sách thành công!')
        loadReservations()
      } catch (error) {
        console.error('Lỗi từ chối đặt sách:', error)
        alert(error.response?.data?.message || 'Có lỗi xảy ra khi từ chối đặt sách!')
      }
    }

    const huyDatSach = async (reservation) => {
      // Xác nhận hủy với thông tin chi tiết
      const confirmMessage =
        `Bạn có chắc chắn muốn hủy đặt sách?\n\n` +
        `📖 Sách: ${reservation.ThongTinSach?.TenSach || 'N/A'}\n` +
        `📅 Ngày đặt: ${formatDate(reservation.NgayDat)}\n` +
        `📊 Trạng thái: ${getTrangThaiText(reservation)}\n\n` +
        `⚠️ Hành động này không thể hoàn tác!`

      if (!confirm(confirmMessage)) return

      try {
        // Hiển thị loading
        const originalText = event.target.textContent
        event.target.textContent = 'Đang hủy...'
        event.target.disabled = true

        const response = await axiosInstance.put(`/datsach/${reservation.MaDat}/huy`, {
          lyDo: 'Hủy bởi độc giả từ giao diện web',
        })

        // Hiển thị thông báo thành công với thông tin chi tiết
        let successMessage = '✅ Hủy đặt sách thành công!\n\n'
        successMessage += `📖 Sách: ${reservation.ThongTinSach?.TenSach || 'N/A'}\n`
        successMessage += `🔢 Mã đặt: ${reservation.MaDat}\n`

        if (response.data.soLuongHoanTra > 0) {
          successMessage += `📚 Đã hoàn trả: ${response.data.soLuongHoanTra} cuốn\n`
        }

        alert(successMessage)
        loadReservations()
      } catch (error) {
        console.error('Lỗi hủy đặt sách:', error)

        // Hiển thị lỗi chi tiết
        let errorMessage = '❌ Có lỗi xảy ra khi hủy đặt sách!\n\n'
        if (error.response?.data?.message) {
          errorMessage += `Chi tiết: ${error.response.data.message}`
        } else {
          errorMessage += 'Vui lòng thử lại sau hoặc liên hệ quản trị viên.'
        }

        alert(errorMessage)
      } finally {
        // Khôi phục trạng thái button
        if (event.target) {
          event.target.textContent = originalText
          event.target.disabled = false
        }
      }
    }

    const changePage = (page) => {
      if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page
      }
    }

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('vi-VN')
    }

    const getTrangThaiText = (reservation) => {
      const trangThaiMap = {
        dat_cho: 'Đặt chỗ',
        cho_duyet: 'Chờ duyệt',
        da_duyet: 'Đã duyệt',
        da_huy: 'Đã hủy',
      }
      return trangThaiMap[reservation.TrangThai] || reservation.TrangThai
    }

    // Watch filters
    watch(
      [filters, currentPage],
      () => {
        loadReservations()
      },
      { deep: true },
    )

    // Load initial data
    onMounted(() => {
      loadReservations()
    })

    return {
      reservations,
      totalItems,
      currentPage,
      limit,
      showReservationModal,
      reservationForm,
      filters,
      isStaff,
      totalPages,
      displayedPages,
      openReservationModal,
      saveReservation,
      duyetDatSach,
      tuChoiDatSach,
      huyDatSach,
      changePage,
      formatDate,
      getTrangThaiText,
    }
  },
}
</script>
