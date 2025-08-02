<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6">Quản lý sách</h1>

    <!-- Thanh tìm kiếm và bộ lọc -->
    <div class="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
      <input
        type="text"
        v-model="searchQuery"
        placeholder="Tìm kiếm sách..."
        class="search-input"
      />
      <select v-model="filterTheLoai" class="filter-select">
        <option value="">Tất cả thể loại</option>
        <option v-for="theLoai in uniqueTheLoai" :key="theLoai" :value="theLoai">
          {{ theLoai }}
        </option>
      </select>
      <select v-model="filterNXB" class="filter-select">
        <option value="">Tất cả NXB</option>
        <option v-for="nxb in publishers" :key="nxb.MaNXB" :value="nxb.MaNXB">
          {{ nxb.TenNXB }}
        </option>
      </select>
      <select v-model="filterTrangThai" class="filter-select">
        <option value="">Tất cả trạng thái</option>
        <option value="available">Còn sách</option>
        <option value="unavailable">Hết sách</option>
      </select>
    </div>

    <!-- Nút thêm sách mới (chỉ hiển thị cho admin và thủ thư) -->
    <div v-if="canManageBooks" class="mb-4">
      <button
        @click="showForm = true"
        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Thêm sách mới
      </button>
    </div>

    <!-- Bảng hiển thị sách -->
    <div class="bg-white shadow-md rounded-lg overflow-hidden mb-6">
      <table class="min-w-full">
        <thead class="bg-gray-100">
          <tr>
            <th class="py-3 px-6 text-left">Tên sách</th>
            <th class="py-3 px-6 text-left">Tác giả</th>
            <th class="py-3 px-6 text-left">Thể loại</th>
            <th class="py-3 px-6 text-left">Nhà xuất bản</th>
            <th class="py-3 px-6 text-center">Số lượng</th>
            <th class="py-3 px-6 text-right">Giá sách</th>
            <th class="py-3 px-6 text-center">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="book in filteredBooks" :key="book._id" class="border-b hover:bg-gray-50">
            <td class="py-3 px-6 text-left">{{ book.TenSach }}</td>
            <td class="py-3 px-6 text-left">{{ book.TacGia }}</td>
            <td class="py-3 px-6 text-left">{{ book.TheLoai }}</td>
            <td class="py-3 px-6 text-left">{{ getPublisherName(book.MaNXB) }}</td>
            <td class="py-3 px-6 text-center">{{ book.SoLuongCon }}</td>
            <td class="py-3 px-6 text-right">{{ formatPrice(book.GiaSach) }}</td>
            <td class="py-3 px-6 text-center">
              <!-- Nút chỉnh sửa và xóa (chỉ cho admin và thủ thư) -->
              <div v-if="canManageBooks" class="flex justify-center space-x-2">
                <button
                  @click="editBook(book)"
                  class="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                >
                  Sửa
                </button>
                <button
                  @click="deleteBook(book)"
                  class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Xóa
                </button>
              </div>
              <!-- Nút mượn/đặt sách (cho độc giả hoặc người dùng chưa đăng nhập) -->
              <div v-if="canReserveBooks || !isLoggedIn" class="flex justify-center space-x-2">
                <button
                  @click="borrowBook(book)"
                  :disabled="isProcessing"
                  class="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <i v-if="isProcessing" class="fas fa-spinner fa-spin mr-1"></i>
                  <i v-else class="fas fa-book mr-1"></i>
                  Mượn sách
                </button>
              </div>
              <!-- Hiển thị thông báo cho admin/librarian -->
              <div v-if="canManageBooks && !canReserveBooks" class="text-gray-500 text-sm">
                <span v-if="book.SoLuongCon > 0" class="text-green-600"
                  >Còn {{ book.SoLuongCon }} cuốn</span
                >
                <span v-else-if="book.SoLuongCon === 0" class="text-red-600">Hết sách</span>
                <span v-else class="text-red-600">Âm {{ book.SoLuongCon }} cuốn</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Form thêm/sửa sách (chỉ hiển thị cho admin và thủ thư) -->
    <div
      v-if="showForm && canManageBooks"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      @click.self="cancelForm"
    >
      <div class="bg-white rounded-lg shadow-md p-6 w-full max-w-3xl">
        <h2 class="text-xl font-bold mb-4">
          {{ isEditing ? 'Sửa thông tin sách' : 'Thêm sách mới' }}
        </h2>
        <form @submit.prevent="submitForm" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Tên sách</label>
              <input type="text" v-model="bookForm.TenSach" required class="form-input" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Tác giả</label>
              <input type="text" v-model="bookForm.TacGia" required class="form-input" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Thể loại</label>
              <input type="text" v-model="bookForm.TheLoai" required class="form-input" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Năm xuất bản</label>
              <input type="number" v-model="bookForm.NamXuatBan" required class="form-input" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Nhà xuất bản</label>
              <select v-model="bookForm.MaNXB" required class="form-input">
                <option value="">Chọn nhà xuất bản</option>
                <option v-for="nxb in publishers" :key="nxb.MaNXB" :value="nxb.MaNXB">
                  {{ nxb.TenNXB }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Số lượng</label>
              <input type="number" v-model="bookForm.SoLuong" required min="0" class="form-input" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Giá sách</label>
              <input type="number" v-model="bookForm.GiaSach" required min="0" class="form-input" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Hình ảnh</label>
              <input type="text" v-model="bookForm.HinhAnh" class="form-input" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">ISBN</label>
              <input type="text" v-model="bookForm.ISBN" class="form-input" />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Mô tả</label>
            <textarea v-model="bookForm.MoTa" rows="3" class="form-input"></textarea>
          </div>
          <div class="flex justify-end space-x-3">
            <button
              type="button"
              @click="cancelForm"
              class="px-4 py-2 border-2 border-red-300 text-red-600 rounded-lg hover:bg-red-50 hover:border-red-400 transition-colors font-medium"
            >
              <i class="fas fa-times mr-1"></i>Hủy
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              {{ isEditing ? 'Cập nhật' : 'Thêm mới' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal xác nhận mượn sách -->
    <div
      v-if="showBorrowModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="cancelBorrow"
    >
      <div class="bg-white rounded-lg shadow-md p-6 w-full max-w-lg mx-4">
        <h3 class="text-lg font-bold mb-4 text-green-600">
          <i class="fas fa-book mr-2"></i>Xác nhận mượn sách
        </h3>
        <div class="mb-4">
          <div class="bg-gray-50 rounded-lg p-4 mb-4">
            <h4 class="font-semibold text-gray-900 mb-2">Thông tin sách:</h4>
            <p class="text-gray-700"><strong>Tên sách:</strong> {{ selectedBook?.TenSach }}</p>
            <p class="text-gray-700"><strong>Tác giả:</strong> {{ selectedBook?.TacGia }}</p>
            <p class="text-gray-700"><strong>Thể loại:</strong> {{ selectedBook?.TheLoai }}</p>
            <p class="text-gray-700">
              <strong>Số lượng còn:</strong>
              <span v-if="selectedBook?.SoLuongCon > 0">{{ selectedBook?.SoLuongCon }} cuốn</span>
              <span v-else-if="selectedBook?.SoLuongCon === 0">Hết sách</span>
              <span v-else class="text-red-600"
                >Âm {{ Math.abs(selectedBook?.SoLuongCon) }} cuốn</span
              >
            </p>
          </div>
          <div class="p-3 bg-green-50 rounded-lg">
            <p class="text-sm text-green-800">
              <i class="fas fa-info-circle mr-1"></i>
              Thời hạn mượn: 14 ngày. Vui lòng chờ thủ thư duyệt yêu cầu.
            </p>
          </div>
        </div>
        <div class="flex justify-end space-x-3 modal-buttons">
          <button
            @click="cancelBorrow"
            :disabled="isProcessing"
            class="px-4 py-2 border-2 border-red-300 text-red-600 rounded-lg hover:bg-red-50 hover:border-red-400 transition-colors disabled:opacity-50 font-medium"
          >
            <i class="fas fa-times mr-1"></i>Hủy
          </button>
          <button
            @click="confirmBorrow"
            :disabled="isProcessing"
            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 font-medium"
          >
            <i v-if="isProcessing" class="fas fa-spinner fa-spin mr-1"></i>
            <i v-else class="fas fa-check mr-1"></i>
            {{ isProcessing ? 'Đang xử lý...' : 'Xác nhận mượn' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal xác nhận đặt chỗ -->
    <div
      v-if="showReserveModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="cancelReserve"
    >
      <div class="bg-white rounded-lg shadow-md p-6 w-full max-w-lg mx-4">
        <h3 class="text-lg font-bold mb-4 text-blue-600">
          <i class="fas fa-bookmark mr-2"></i>Xác nhận đặt chỗ
        </h3>
        <div class="mb-4">
          <div class="bg-gray-50 rounded-lg p-4 mb-4">
            <h4 class="font-semibold text-gray-900 mb-2">Thông tin sách:</h4>
            <p class="text-gray-700"><strong>Tên sách:</strong> {{ selectedBook?.TenSach }}</p>
            <p class="text-gray-700"><strong>Tác giả:</strong> {{ selectedBook?.TacGia }}</p>
            <p class="text-gray-700"><strong>Thể loại:</strong> {{ selectedBook?.TheLoai }}</p>
            <p class="text-red-600"><strong>Trạng thái:</strong> Hết sách</p>
          </div>
          <div class="p-3 bg-blue-50 rounded-lg">
            <p class="text-sm text-blue-800">
              <i class="fas fa-info-circle mr-1"></i>
              Bạn sẽ được thông báo khi sách có sẵn và có thể mượn trong vòng 24 giờ kể từ khi nhận
              thông báo.
            </p>
          </div>
        </div>
        <div class="flex justify-end space-x-3 modal-buttons">
          <button
            @click="cancelReserve"
            :disabled="isProcessing"
            class="px-4 py-2 border-2 border-red-300 text-red-600 rounded-lg hover:bg-red-50 hover:border-red-400 transition-colors disabled:opacity-50 font-medium"
          >
            <i class="fas fa-times mr-1"></i>Hủy
          </button>
          <button
            @click="confirmReserve"
            :disabled="isProcessing"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium"
          >
            <i v-if="isProcessing" class="fas fa-spinner fa-spin mr-1"></i>
            <i v-else class="fas fa-check mr-1"></i>
            {{ isProcessing ? 'Đang xử lý...' : 'Xác nhận đặt chỗ' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal thông báo thành công -->
    <div
      v-if="showSuccessModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg shadow-md p-6 w-full max-w-md">
        <div class="text-center">
          <div
            class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4"
          >
            <i class="fas fa-check text-green-600 text-xl"></i>
          </div>
          <h3 class="text-lg font-bold mb-2 text-green-600">{{ successMessage.title }}</h3>
          <p class="text-gray-700 mb-2">{{ successMessage.content }}</p>
          <div v-if="successMessage.maDat" class="p-3 bg-green-50 rounded-lg mb-4">
            <p class="text-sm text-green-800">
              <i class="fas fa-bookmark mr-1"></i>
              <span v-if="successMessage.actionType === 'reserve'">
                Mã đặt sách: <span class="font-semibold">{{ successMessage.maDat }}</span>
              </span>
              <span v-else-if="successMessage.actionType === 'borrow'">
                Mã phiếu mượn: <span class="font-semibold">{{ successMessage.maDat }}</span>
              </span>
            </p>
          </div>
          <button
            @click="closeSuccessModal"
            class="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <i class="fas fa-check mr-1"></i>
            <span v-if="successMessage.actionType === 'borrow'">Xem phiếu mượn</span>
            <span v-else-if="successMessage.actionType === 'reserve'">Xem đặt sách</span>
            <span v-else>Đóng</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from '../utils/axiosInstance'
import { mapState } from 'vuex'

export default {
  name: 'Books',
  data() {
    return {
      books: [],
      publishers: [],
      searchQuery: '',
      filterTheLoai: '',
      filterNXB: '',
      filterTrangThai: '',
      showForm: false,
      showBorrowModal: false,
      showReserveModal: false,
      showSuccessModal: false,
      isEditing: false,
      isLoading: false,
      isProcessing: false,
      selectedBook: null,
      successMessage: {
        title: '',
        content: '',
        maDat: null,
        actionType: '', // 'borrow' hoặc 'reserve'
      },
      bookForm: {
        TenSach: '',
        TacGia: '',
        TheLoai: '',
        NamXuatBan: new Date().getFullYear(),
        MaNXB: '',
        SoLuong: 0,
        GiaSach: 0,
        MoTa: '',
        HinhAnh: '',
      },
    }
  },
  computed: {
    ...mapState({
      userRole: (state) => state.auth.role,
      userId: (state) => {
        const user = state.auth.user
        // Lấy ID từ các trường có thể có
        return user?.MaDocGia || user?._id || user?.id || user?.username
      },
      user: (state) => state.auth.user,
      isLoggedIn: (state) => !!state.auth.token && !!state.auth.user,
    }),
    uniqueTheLoai() {
      return [...new Set(this.books.map((book) => book.TheLoai))]
    },
    filteredBooks() {
      return this.books.filter((book) => {
        const matchesSearch =
          !this.searchQuery ||
          book.TenSach.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          book.TacGia.toLowerCase().includes(this.searchQuery.toLowerCase())

        const matchesTheLoai = !this.filterTheLoai || book.TheLoai === this.filterTheLoai

        const matchesNXB = !this.filterNXB || book.MaNXB === this.filterNXB

        const matchesTrangThai =
          !this.filterTrangThai ||
          (this.filterTrangThai === 'available' && book.SoLuongCon > 0) ||
          (this.filterTrangThai === 'unavailable' && book.SoLuongCon === 0)

        return matchesSearch && matchesTheLoai && matchesNXB && matchesTrangThai
      })
    },
    canManageBooks() {
      return this.userRole === 'admin' || this.userRole === 'librarian'
    },
    canReserveBooks() {
      const canReserve = this.userRole === 'reader'
      console.log('Debug - canReserveBooks:', {
        userRole: this.userRole,
        canReserve: canReserve,
      })
      return canReserve
    },
  },
  methods: {
    formatPrice(price) {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
      }).format(price)
    },
    getPublisherName(maNXB) {
      const publisher = this.publishers.find((p) => p.MaNXB === maNXB)
      return publisher ? publisher.TenNXB : maNXB
    },
    async fetchBooks() {
      try {
        const response = await axios.get('/sach')
        this.books = response.data.sachs || []
      } catch (error) {
        console.error('Error fetching books:', error)
        notify('Không thể tải danh sách sách', 'error')
      }
    },
    async fetchPublishers() {
      try {
        const response = await axios.get('/nhaxuatban')
        this.publishers = response.data
      } catch (error) {
        console.error('Error fetching publishers:', error)
        notify('Không thể tải danh sách nhà xuất bản', 'error')
      }
    },
    showAddForm() {
      this.isEditing = false
      this.showForm = true
      this.bookForm = {
        TenSach: '',
        TacGia: '',
        TheLoai: '',
        NamXuatBan: new Date().getFullYear(),
        MaNXB: '',
        SoLuong: 0,
        GiaSach: 0,
        MoTa: '',
        HinhAnh: '',
        ISBN: '',
      }
    },
    editBook(book) {
      this.isEditing = true
      this.showForm = true
      this.bookForm = { ...book }
    },
    async submitForm() {
      try {
        console.log('🔄 Submitting form data:', this.bookForm)

        if (this.isEditing) {
          // Sử dụng MaSach nếu có, nếu không thì dùng _id
          const id = this.bookForm.MaSach || this.bookForm._id
          await axios.put(`/sach/${id}`, this.bookForm)
          notify('Cập nhật sách thành công!', 'success')
        } else {
          const response = await axios.post('/sach', this.bookForm)
          console.log('✅ Response:', response.data)
          notify('Thêm sách mới thành công!', 'success')
        }
        this.showForm = false
        this.fetchBooks()
      } catch (error) {
        console.error('❌ Error submitting form:', error)
        const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi lưu thông tin sách'
        notify(errorMessage, 'error')
      }
    },
    async deleteBook(book) {
      if (!confirm(`Bạn có chắc muốn xóa sách "${book.TenSach}"?`)) return

      try {
        const id = book.MaSach || book._id
        await axios.delete(`/sach/${id}`)
        notify('Xóa sách thành công!', 'success')
        this.fetchBooks()
      } catch (error) {
        console.error('Error deleting book:', error)
        const errorMessage = error.response?.data?.message || 'Không thể xóa sách'
        notify(errorMessage, 'error')
      }
    },
    cancelForm() {
      // Reset form và đóng modal
      this.showForm = false
      this.isEditing = false
      this.selectedBook = null

      // Reset form data
      this.bookForm = {
        TenSach: '',
        TacGia: '',
        TheLoai: '',
        NamXuatBan: new Date().getFullYear(),
        MaNXB: '',
        SoLuong: 0,
        GiaSach: 0,
        MoTa: '',
        HinhAnh: '',
        ISBN: '',
      }

      console.log('Đã hủy thao tác form')
    },
    async borrowBook(book) {
      // Validation cơ bản
      if (this.isProcessing) return

      // Kiểm tra trạng thái đăng nhập toàn diện
      if (!this.isLoggedIn || !this.user || !this.userRole) {
        notify('Vui lòng đăng nhập để mượn sách!', 'error')
        this.$router.push('/login')
        return
      }

      // Kiểm tra vai trò người dùng
      if (this.userRole !== 'reader') {
        notify('Chỉ độc giả mới có thể mượn sách!', 'error')
        return
      }

      // BỎ kiểm tra số lượng sách để tạo lỗi

      this.selectedBook = book
      this.showBorrowModal = true
    },
    cancelBorrow() {
      // Debug log
      console.log('🚫 cancelBorrow called - Đang hủy modal mượn sách')

      // Reset trạng thái và đóng modal mượn sách
      this.showBorrowModal = false
      this.selectedBook = null
      this.isProcessing = false

      // Hiển thị thông báo hủy
      console.log('✅ Đã hủy thao tác mượn sách thành công')

      // Có thể thêm notification nhẹ
      // this.$toast.info('Đã hủy yêu cầu mượn sách')
    },
    cancelReserve() {
      // Debug log
      console.log('🚫 cancelReserve called - Đang hủy modal đặt chỗ')

      // Reset trạng thái và đóng modal đặt chỗ
      this.showReserveModal = false
      this.selectedBook = null
      this.isProcessing = false

      // Hiển thị thông báo hủy
      console.log('✅ Đã hủy thao tác đặt chỗ thành công')

      // Có thể thêm notification nhẹ
      // this.$toast.info('Đã hủy yêu cầu đặt chỗ')
    },
    async confirmBorrow() {
      // Kiểm tra lại trạng thái đăng nhập
      if (!this.isLoggedIn || !this.user || !this.userId) {
        notify('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!', 'error')
        this.$router.push('/login')
        return
      }

      this.isProcessing = true

      try {
        const response = await axios.post('/theodoimuonsach', {
          MaSach: this.selectedBook.MaSach,
          NgayHenTra: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 ngày sau
          GhiChu: 'Mượn sách trực tiếp',
        })

        this.successMessage = {
          title: 'Mượn sách thành công!',
          content: `Yêu cầu mượn sách "${this.selectedBook.TenSach}" đã được gửi thành công. Vui lòng chờ thủ thư duyệt.`,
          maDat: response.data.maDat || null,
          actionType: 'borrow',
        }

        this.showBorrowModal = false
        this.showSuccessModal = true
        this.selectedBook = null
        this.fetchBooks()
      } catch (error) {
        console.error('Lỗi khi mượn sách:', error)
        notify(error?.response?.data?.message || 'Có lỗi xảy ra khi mượn sách', 'error')
      } finally {
        this.isProcessing = false
      }
    },
    async reserveBook(book) {
      // Validation cơ bản
      if (this.isProcessing) return

      // Kiểm tra đăng nhập
      if (!this.isLoggedIn || !this.user || !this.userId) {
        notify('Vui lòng đăng nhập để đặt chỗ!', 'error')
        this.$router.push('/login')
        return
      }

      // Kiểm tra vai trò
      if (this.userRole !== 'reader') {
        notify('Chỉ độc giả mới có thể đặt chỗ sách!', 'error')
        return
      }

      this.selectedBook = book
      this.showReserveModal = true
    },
    async confirmReserve() {
      if (!this.userId) {
        notify('Vui lòng đăng nhập để đặt chỗ!', 'error')
        return
      }

      this.isProcessing = true

      try {
        const response = await axios.post('/datsach', {
          MaSach: this.selectedBook.MaSach,
          SoLuong: 1,
          TrangThai: 'dat_cho',
          GhiChu: 'Đặt chỗ trước',
        })

        this.successMessage = {
          title: 'Đặt chỗ thành công!',
          content: `Bạn đã đặt chỗ thành công cho sách "${this.selectedBook.TenSach}". Bạn sẽ được thông báo khi sách có sẵn.`,
          maDat: response.data.maDat,
          actionType: 'reserve',
        }

        this.showReserveModal = false
        this.showSuccessModal = true
        this.selectedBook = null
        this.fetchBooks()
      } catch (error) {
        console.error('Lỗi khi đặt chỗ:', error)
        notify(error?.response?.data?.message || 'Có lỗi xảy ra khi đặt chỗ', 'error')
      } finally {
        this.isProcessing = false
      }
    },
    closeSuccessModal() {
      this.showSuccessModal = false
      const actionType = this.successMessage.actionType
      this.successMessage = {
        title: '',
        content: '',
        maDat: null,
        actionType: '',
      }

      // Chuyển hướng tùy theo loại thao tác
      if (actionType === 'borrow') {
        // Chuyển hướng đến trang mượn sách
        this.$router.push('/borrows')
      } else if (actionType === 'reserve') {
        // Chuyển hướng đến trang đặt sách
        this.$router.push('/reservations')
      }
    },
    handleEscapeKey(event) {
      if (event.key === 'Escape') {
        // Hủy modal nào đang mở
        if (this.showBorrowModal) {
          this.cancelBorrow()
        } else if (this.showReserveModal) {
          this.cancelReserve()
        } else if (this.showForm) {
          this.cancelForm()
        } else if (this.showSuccessModal) {
          this.closeSuccessModal()
        }
      }
    },
  },
  mounted() {
    // Log user info when component mounts
    console.log('Debug - Component mounted. User info:', {
      userId: this.userId,
      userRole: this.userRole,
      user: this.user,
      isLoggedIn: this.isLoggedIn,
      canReserveBooks: this.canReserveBooks,
      canManageBooks: this.canManageBooks,
      authState: this.$store.state.auth,
    })
    this.fetchBooks()
    this.fetchPublishers()

    // Thêm event listener cho phím ESC
    document.addEventListener('keydown', this.handleEscapeKey)
  },
  beforeUnmount() {
    // Cleanup event listener
    document.removeEventListener('keydown', this.handleEscapeKey)
  },
}
</script>

<style scoped>
.search-input,
.filter-select,
.form-input {
  width: 100%;
  padding: 0.5rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  outline: none;
  transition: all 0.3s;
}

.search-input:focus,
.filter-select:focus,
.form-input:focus {
  border-color: #60a5fa;
  box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.2);
}

.filter-select {
  background-color: white;
}

/* Đảm bảo nút hủy hiển thị rõ ràng */
button[class*='border-red'] {
  box-shadow: 0 1px 3px rgba(239, 68, 68, 0.1);
  min-width: 80px;
}

button[class*='border-red']:hover {
  box-shadow: 0 4px 6px rgba(239, 68, 68, 0.2);
  transform: translateY(-1px);
}

/* Đảm bảo modal buttons có kích thước phù hợp */
.modal-buttons button {
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
