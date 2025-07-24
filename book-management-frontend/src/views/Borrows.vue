<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Quản lý mượn trả sách</h1>
      <button
        v-if="isStaff"
        @click="openBorrowModal()"
        class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Tạo phiếu mượn
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
            <option value="cho_duyet">Chờ duyệt</option>
            <option value="dang_muon">Đang mượn</option>
            <option value="da_tra">Đã trả</option>
            <option value="qua_han">Quá hạn</option>
            <option value="cho_gia_han">Chờ gia hạn</option>
            <option value="tu_choi">Từ chối</option>
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

    <!-- Borrows List -->
    <div class="bg-white shadow rounded-lg overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th
              scope="col"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Mã mượn
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
              Ngày mượn
            </th>
            <th
              scope="col"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Ngày hẹn trả
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
          <tr v-for="borrow in borrows" :key="borrow.MaMuon">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              {{ borrow.MaMuon }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ borrow.ThongTinSach?.TenSach }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ borrow.ThongTinDocGia?.HoTen }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ formatDate(borrow.NgayMuon) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ formatDate(borrow.NgayHenTra) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
              <span
                :class="[
                  'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                  {
                    'bg-yellow-100 text-yellow-800': borrow.TrangThai === 'cho_duyet',
                    'bg-green-100 text-green-800': borrow.TrangThai === 'dang_muon',
                    'bg-blue-100 text-blue-800': borrow.TrangThai === 'da_tra',
                    'bg-red-100 text-red-800': isQuaHan(borrow),
                    'bg-purple-100 text-purple-800': borrow.TrangThai === 'cho_gia_han',
                    'bg-gray-100 text-gray-800': borrow.TrangThai === 'tu_choi',
                    'bg-orange-100 text-orange-800': borrow.TrangThai === 'da_huy',
                  },
                ]"
              >
                {{ getTrangThaiText(borrow) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <!-- Actions for Librarian -->
              <template v-if="isStaff">
                <button
                  v-if="borrow.TrangThai === 'cho_duyet'"
                  @click="duyetMuonSach(borrow)"
                  class="text-green-600 hover:text-green-900 mr-2"
                >
                  Duyệt
                </button>
                <button
                  v-if="borrow.TrangThai === 'cho_duyet'"
                  @click="tuChoiMuonSach(borrow)"
                  class="text-red-600 hover:text-red-900 mr-2"
                >
                  Từ chối
                </button>
                <button
                  v-if="borrow.TrangThai === 'dang_muon'"
                  @click="traSach(borrow)"
                  class="text-blue-600 hover:text-blue-900 mr-2"
                >
                  Trả sách
                </button>
                <button
                  v-if="borrow.TrangThai === 'cho_gia_han'"
                  @click="duyetGiaHan(borrow)"
                  class="text-green-600 hover:text-green-900 mr-2"
                >
                  Duyệt gia hạn
                </button>
                <button
                  v-if="borrow.TrangThai === 'cho_gia_han'"
                  @click="tuChoiGiaHan(borrow)"
                  class="text-red-600 hover:text-red-900 mr-2"
                >
                  Từ chối gia hạn
                </button>
              </template>

              <!-- Actions for Reader -->
              <template v-else>
                <button
                  v-if="['cho_duyet', 'cho_gia_han'].includes(borrow.TrangThai)"
                  @click="huyPhieuMuon(borrow)"
                  class="text-red-600 hover:text-red-900 mr-2"
                >
                  Hủy
                </button>
                <button
                  v-if="borrow.TrangThai === 'dang_muon' && !isQuaHan(borrow)"
                  @click="yeuCauGiaHan(borrow)"
                  class="text-indigo-600 hover:text-indigo-900"
                >
                  Gia hạn
                </button>
              </template>
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

    <!-- Borrow Modal -->
    <div v-if="showBorrowModal" class="fixed z-10 inset-0 overflow-y-auto">
      <div
        class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0"
      >
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

        <div
          class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
        >
          <form @submit.prevent="saveBorrow">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700"> Độc giả * </label>
                  <div class="relative">
                    <input
                      type="text"
                      v-model="readerSearchTerm"
                      @input="filterReaders"
                      @focus="showReaderDropdown = true"
                      placeholder="Tìm kiếm độc giả..."
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                    <div
                      v-if="showReaderDropdown && filteredReaders.length > 0"
                      class="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
                    >
                      <div
                        v-for="reader in filteredReaders"
                        :key="reader.MaDocGia"
                        @click="selectReader(reader)"
                        class="px-3 py-2 cursor-pointer hover:bg-gray-100"
                      >
                        {{ reader.HoTen }} ({{ reader.MaDocGia }})
                      </div>
                    </div>
                    <div
                      v-else-if="showReaderDropdown && availableReaders.length === 0"
                      class="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg p-3 text-gray-500"
                    >
                      Đang tải danh sách độc giả...
                    </div>
                  </div>
                  <input type="hidden" v-model="borrowForm.MaDocGia" required />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700"> Sách * </label>
                  <div class="relative">
                    <input
                      type="text"
                      v-model="bookSearchTerm"
                      @input="filterBooks"
                      @focus="showBookDropdown = true"
                      placeholder="Tìm kiếm sách..."
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                    <div
                      v-if="showBookDropdown && filteredBooks.length > 0"
                      class="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
                    >
                      <div
                        v-for="book in filteredBooks"
                        :key="book.MaSach"
                        @click="selectBook(book)"
                        class="px-3 py-2 cursor-pointer hover:bg-gray-100"
                      >
                        <div class="font-medium">{{ book.TenSach }}</div>
                        <div class="text-sm text-gray-500">
                          {{ book.TacGia }} (Còn: {{ book.SoLuongCon }})
                        </div>
                      </div>
                    </div>
                    <div
                      v-else-if="showBookDropdown && availableBooks.length === 0"
                      class="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg p-3 text-gray-500"
                    >
                      Đang tải danh sách sách...
                    </div>
                  </div>
                  <input type="hidden" v-model="borrowForm.MaSach" required />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700"> Ngày hẹn trả * </label>
                  <input
                    type="date"
                    v-model="borrowForm.NgayHenTra"
                    required
                    :min="minReturnDate"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>
            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                :disabled="isSubmitting"
                :class="[
                  'w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm',
                  isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700',
                ]"
              >
                {{ isSubmitting ? 'Đang tạo...' : 'Tạo phiếu mượn' }}
              </button>
              <button
                type="button"
                class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                @click="closeBorrowModal"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Extension Modal -->
    <div v-if="showExtensionModal" class="fixed z-10 inset-0 overflow-y-auto">
      <div
        class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0"
      >
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

        <div
          class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
        >
          <form @submit.prevent="saveExtension">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700"> Ngày hẹn trả mới </label>
                  <input
                    type="date"
                    v-model="extensionForm.NgayHenTra"
                    required
                    :min="minExtensionDate"
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
                Xác nhận
              </button>
              <button
                type="button"
                class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                @click="showExtensionModal = false"
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
  name: 'Borrows',
  setup() {
    const store = useStore()
    const isStaff = computed(() => store.getters['auth/isStaff'])

    // Data
    const borrows = ref([])
    const availableBooks = ref([])
    const availableReaders = ref([])
    const filteredBooks = ref([])
    const filteredReaders = ref([])
    const totalItems = ref(0)
    const currentPage = ref(1)
    const limit = ref(10)
    const showBorrowModal = ref(false)
    const showExtensionModal = ref(false)
    const showBookDropdown = ref(false)
    const showReaderDropdown = ref(false)
    const selectedBorrow = ref(null)
    const isSubmitting = ref(false)
    const bookSearchTerm = ref('')
    const readerSearchTerm = ref('')

    const borrowForm = ref({
      MaDocGia: '',
      MaSach: '',
      NgayHenTra: '',
    })

    const extensionForm = ref({
      NgayHenTra: '',
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

    const minReturnDate = computed(() => {
      const date = new Date()
      date.setDate(date.getDate() + 1)
      return date.toISOString().split('T')[0]
    })

    const minExtensionDate = computed(() => {
      if (!selectedBorrow.value) return minReturnDate.value
      const date = new Date(selectedBorrow.value.NgayHenTra)
      date.setDate(date.getDate() + 1)
      return date.toISOString().split('T')[0]
    })

    // Methods
    const loadBorrows = async () => {
      try {
        const params = {
          page: currentPage.value,
          limit: limit.value,
          ...filters.value,
        }

        const response = await axiosInstance.get('/theodoimuonsach', { params })
        borrows.value = response.data.muonSachs
        totalItems.value = response.data.totalCount
      } catch (error) {
        console.error('Lỗi tải danh sách mượn sách:', error)
        alert(error.response?.data?.message || 'Có lỗi xảy ra khi tải danh sách mượn sách!')
      }
    }

    const loadAvailableBooks = async () => {
      try {
        const response = await axiosInstance.get('/theodoimuonsach/available-books')
        availableBooks.value = response.data
      } catch (error) {
        console.error('Lỗi tải danh sách sách:', error)
      }
    }

    const loadAvailableReaders = async () => {
      try {
        if (isStaff.value) {
          const response = await axiosInstance.get('/theodoimuonsach/available-readers')
          availableReaders.value = response.data
        }
      } catch (error) {
        console.error('Lỗi tải danh sách độc giả:', error)
      }
    }

    const openBorrowModal = async () => {
      borrowForm.value = {
        MaDocGia: '',
        MaSach: '',
        NgayHenTra: '',
      }
      bookSearchTerm.value = ''
      readerSearchTerm.value = ''
      showBorrowModal.value = true

      // Load data for dropdowns
      await Promise.all([loadAvailableBooks(), loadAvailableReaders()])

      // Initialize filtered lists
      filteredBooks.value = availableBooks.value
      filteredReaders.value = availableReaders.value
    }

    const closeBorrowModal = () => {
      showBorrowModal.value = false
      showBookDropdown.value = false
      showReaderDropdown.value = false
      borrowForm.value = {
        MaDocGia: '',
        MaSach: '',
        NgayHenTra: '',
      }
      bookSearchTerm.value = ''
      readerSearchTerm.value = ''
    }

    const filterBooks = () => {
      const term = bookSearchTerm.value.toLowerCase()
      filteredBooks.value = availableBooks.value.filter(
        (book) =>
          book.TenSach.toLowerCase().includes(term) ||
          book.TacGia.toLowerCase().includes(term) ||
          book.MaSach.toLowerCase().includes(term),
      )
      showBookDropdown.value = true
    }

    const filterReaders = () => {
      const term = readerSearchTerm.value.toLowerCase()
      filteredReaders.value = availableReaders.value.filter(
        (reader) =>
          reader.HoTen.toLowerCase().includes(term) ||
          reader.MaDocGia.toLowerCase().includes(term) ||
          reader.Email.toLowerCase().includes(term),
      )
      showReaderDropdown.value = true
    }

    const selectBook = (book) => {
      borrowForm.value.MaSach = book.MaSach
      bookSearchTerm.value = `${book.TenSach} - ${book.TacGia}`
      showBookDropdown.value = false
    }

    const selectReader = (reader) => {
      borrowForm.value.MaDocGia = reader.MaDocGia
      readerSearchTerm.value = `${reader.HoTen} (${reader.MaDocGia})`
      showReaderDropdown.value = false
    }

    const saveBorrow = async () => {
      if (isSubmitting.value) return

      try {
        isSubmitting.value = true
        await axiosInstance.post('/theodoimuonsach', borrowForm.value)
        alert('Tạo phiếu mượn thành công!')
        closeBorrowModal()
        loadBorrows()
      } catch (error) {
        console.error('Lỗi tạo phiếu mượn:', error)
        alert(error.response?.data?.message || 'Có lỗi xảy ra khi tạo phiếu mượn!')
      } finally {
        isSubmitting.value = false
      }
    }

    const duyetMuonSach = async (borrow) => {
      try {
        await axiosInstance.put(`/theodoimuonsach/${borrow.MaMuon}/duyet`)
        alert('Duyệt yêu cầu mượn sách thành công!')
        loadBorrows()
      } catch (error) {
        console.error('Lỗi duyệt mượn sách:', error)
        alert(error.response?.data?.message || 'Có lỗi xảy ra khi duyệt mượn sách!')
      }
    }

    const tuChoiMuonSach = async (borrow) => {
      try {
        const lyDo = prompt('Nhập lý do từ chối:')
        if (lyDo === null) return

        await axiosInstance.put(`/theodoimuonsach/${borrow.MaMuon}/tu-choi`, { lyDo })
        alert('Từ chối yêu cầu mượn sách thành công!')
        loadBorrows()
      } catch (error) {
        console.error('Lỗi từ chối mượn sách:', error)
        alert(error.response?.data?.message || 'Có lỗi xảy ra khi từ chối mượn sách!')
      }
    }

    const traSach = async (borrow) => {
      if (!confirm('Xác nhận trả sách?')) return

      try {
        await axiosInstance.put(`/theodoimuonsach/${borrow.MaMuon}/tra`)
        alert('Trả sách thành công!')
        loadBorrows()
      } catch (error) {
        console.error('Lỗi trả sách:', error)
        alert(error.response?.data?.message || 'Có lỗi xảy ra khi trả sách!')
      }
    }

    const yeuCauGiaHan = (borrow) => {
      selectedBorrow.value = borrow
      extensionForm.value.NgayHenTra = ''
      showExtensionModal.value = true
    }

    const saveExtension = async () => {
      try {
        await axiosInstance.put(
          `/theodoimuonsach/${selectedBorrow.value.MaMuon}/gia-han`,
          extensionForm.value,
        )
        alert('Gửi yêu cầu gia hạn thành công!')
        showExtensionModal.value = false
        loadBorrows()
      } catch (error) {
        console.error('Lỗi gia hạn:', error)
        alert(error.response?.data?.message || 'Có lỗi xảy ra khi gia hạn!')
      }
    }

    const duyetGiaHan = async (borrow) => {
      try {
        await axiosInstance.put(`/theodoimuonsach/${borrow.MaMuon}/duyet-gia-han`)
        alert('Duyệt gia hạn thành công!')
        loadBorrows()
      } catch (error) {
        console.error('Lỗi duyệt gia hạn:', error)
        alert(error.response?.data?.message || 'Có lỗi xảy ra khi duyệt gia hạn!')
      }
    }

    const tuChoiGiaHan = async (borrow) => {
      try {
        const lyDo = prompt('Nhập lý do từ chối:')
        if (lyDo === null) return

        await axiosInstance.put(`/theodoimuonsach/${borrow.MaMuon}/tu-choi-gia-han`, { lyDo })
        alert('Từ chối gia hạn thành công!')
        loadBorrows()
      } catch (error) {
        console.error('Lỗi từ chối gia hạn:', error)
        alert(error.response?.data?.message || 'Có lỗi xảy ra khi từ chối gia hạn!')
      }
    }

    const huyPhieuMuon = async (borrow) => {
      try {
        const confirmMessage =
          borrow.TrangThai === 'cho_duyet'
            ? 'Bạn có chắc chắn muốn hủy yêu cầu mượn sách này?'
            : 'Bạn có chắc chắn muốn hủy yêu cầu gia hạn này?'

        if (!confirm(confirmMessage)) return

        await axiosInstance.put(`/theodoimuonsach/${borrow.MaMuon}/huy`)
        alert('Hủy yêu cầu thành công!')
        loadBorrows()
      } catch (error) {
        console.error('Lỗi hủy phiếu mượn:', error)
        alert(error.response?.data?.message || 'Có lỗi xảy ra khi hủy yêu cầu!')
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

    const isQuaHan = (borrow) => {
      return borrow.TrangThai === 'dang_muon' && new Date(borrow.NgayHenTra) < new Date()
    }

    const getTrangThaiText = (borrow) => {
      if (isQuaHan(borrow)) return 'Quá hạn'

      const trangThaiMap = {
        cho_duyet: 'Chờ duyệt',
        dang_muon: 'Đang mượn',
        da_tra: 'Đã trả',
        cho_gia_han: 'Chờ gia hạn',
        tu_choi: 'Từ chối',
        da_huy: 'Đã hủy',
      }
      return trangThaiMap[borrow.TrangThai] || borrow.TrangThai
    }

    // Watch filters
    watch(
      [filters, currentPage],
      () => {
        loadBorrows()
      },
      { deep: true },
    )

    // Load initial data
    onMounted(() => {
      loadBorrows()

      // Close dropdowns when clicking outside
      document.addEventListener('click', (e) => {
        if (!e.target.closest('.relative')) {
          showBookDropdown.value = false
          showReaderDropdown.value = false
        }
      })
    })

    return {
      borrows,
      availableBooks,
      availableReaders,
      filteredBooks,
      filteredReaders,
      totalItems,
      currentPage,
      limit,
      showBorrowModal,
      showExtensionModal,
      showBookDropdown,
      showReaderDropdown,
      borrowForm,
      extensionForm,
      filters,
      isStaff,
      isSubmitting,
      bookSearchTerm,
      readerSearchTerm,
      totalPages,
      displayedPages,
      minReturnDate,
      minExtensionDate,
      openBorrowModal,
      closeBorrowModal,
      filterBooks,
      filterReaders,
      selectBook,
      selectReader,
      saveBorrow,
      duyetMuonSach,
      tuChoiMuonSach,
      traSach,
      yeuCauGiaHan,
      saveExtension,
      duyetGiaHan,
      tuChoiGiaHan,
      huyPhieuMuon,
      changePage,
      formatDate,
      isQuaHan,
      getTrangThaiText,
    }
  },
}
</script>
