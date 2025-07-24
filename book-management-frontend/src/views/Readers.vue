<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6">Quản lý độc giả</h1>

    <!-- Thanh tìm kiếm -->
    <div class="mb-6">
      <input
        type="text"
        v-model="searchQuery"
        placeholder="Tìm kiếm độc giả..."
        class="search-input"
      />
    </div>

    <!-- Bảng hiển thị độc giả -->
    <div class="bg-white shadow-md rounded-lg overflow-hidden mb-6">
      <table class="min-w-full">
        <thead class="bg-gray-100">
          <tr>
            <th class="py-3 px-6 text-left">Mã độc giả</th>
            <th class="py-3 px-6 text-left">Họ tên</th>
            <th class="py-3 px-6 text-left">Email</th>
            <th class="py-3 px-6 text-left">Số điện thoại</th>
            <th class="py-3 px-6 text-left">Ngày đăng ký</th>
            <th class="py-3 px-6 text-left">Trạng thái</th>
            <th class="py-3 px-6 text-center">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="reader in filteredReaders"
            :key="reader.MaDocGia"
            class="border-b hover:bg-gray-50"
          >
            <td class="py-3 px-6 text-left">{{ reader.MaDocGia }}</td>
            <td class="py-3 px-6 text-left">{{ reader.HoTen }}</td>
            <td class="py-3 px-6 text-left">{{ reader.Email }}</td>
            <td class="py-3 px-6 text-left">{{ reader.SoDienThoai }}</td>
            <td class="py-3 px-6 text-left">{{ formatDate(reader.NgayDangKy) }}</td>
            <td class="py-3 px-6 text-left">
              <span :class="getStatusClass(reader.TrangThai)">
                {{ reader.TrangThai }}
              </span>
            </td>
            <td class="py-3 px-6 text-center">
              <button @click="editReader(reader)" class="text-blue-600 hover:text-blue-800 mr-3">
                Sửa
              </button>
              <button
                @click="deleteReader(reader.MaDocGia)"
                class="text-red-600 hover:text-red-800"
              >
                Xóa
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Form thêm/sửa độc giả -->
    <div v-if="showForm" class="bg-white shadow-md rounded-lg p-6">
      <h2 class="text-xl font-bold mb-4">
        {{ isEditing ? 'Sửa thông tin độc giả' : 'Thêm độc giả mới' }}
      </h2>
      <form @submit.prevent="submitForm" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-if="!isEditing">
            <label class="block text-sm font-medium text-gray-700">Mã độc giả</label>
            <input type="text" v-model="readerForm.MaDocGia" required class="form-input" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Họ tên</label>
            <input type="text" v-model="readerForm.HoTen" required class="form-input" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Ngày sinh</label>
            <input type="date" v-model="readerForm.NgaySinh" required class="form-input" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Email</label>
            <input type="text" v-model="readerForm.Email" required class="form-input" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Số điện thoại</label>
            <input type="tel" v-model="readerForm.SoDienThoai" required class="form-input" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Địa chỉ</label>
            <input type="text" v-model="readerForm.DiaChi" required class="form-input" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Ngày đăng ký</label>
            <input type="date" v-model="readerForm.NgayDangKy" required class="form-input" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Ngày hết hạn</label>
            <input type="date" v-model="readerForm.NgayHetHan" required class="form-input" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Trạng thái</label>
            <select v-model="readerForm.TrangThai" required class="form-input">
              <option value="Hoạt động">Hoạt động</option>
              <option value="Khóa">Khóa</option>
              <option value="Hết hạn">Hết hạn</option>
            </select>
          </div>
        </div>
        <div class="flex justify-end space-x-3">
          <button
            type="button"
            @click="cancelForm"
            class="px-4 py-2 border rounded-lg hover:bg-gray-100"
          >
            Hủy
          </button>
          <button
            type="submit"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {{ isEditing ? 'Cập nhật' : 'Thêm mới' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Nút thêm mới -->
    <button
      v-if="!showForm"
      @click="showAddForm"
      class="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
    >
      Thêm độc giả mới
    </button>
  </div>
</template>

<script>
import axios from '../utils/axiosInstance'

export default {
  name: 'Readers',
  data() {
    return {
      readers: [],
      searchQuery: '',
      showForm: false,
      isEditing: false,
      readerForm: {
        MaDocGia: '',
        HoTen: '',
        NgaySinh: '',
        DiaChi: '',
        Email: '',
        SoDienThoai: '',
        NgayDangKy: '',
        NgayHetHan: '',
        TrangThai: 'Hoạt động',
      },
    }
  },
  computed: {
    filteredReaders() {
      const query = this.searchQuery.toLowerCase()
      return this.readers.filter(
        (reader) =>
          reader.MaDocGia.toLowerCase().includes(query) ||
          reader.HoTen.toLowerCase().includes(query) ||
          reader.Email.toLowerCase().includes(query) ||
          reader.SoDienThoai.includes(query),
      )
    },
  },
  methods: {
    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString('vi-VN')
    },
    getStatusClass(status) {
      switch (status) {
        case 'Hoạt động':
          return 'text-green-600'
        case 'Khóa':
          return 'text-red-600'
        case 'Hết hạn':
          return 'text-yellow-600'
        default:
          return 'text-gray-600'
      }
    },
    async fetchReaders() {
      try {
        // Lấy nhiều hơn 10 độc giả mặc định để hiển thị đầy đủ
        const response = await axios.get('/docgia', {
          params: {
            limit: 100, // Tăng limit để hiển thị đầy đủ danh sách
            page: 1,
          },
        })
        // API trả về object có cấu trúc { docgias: [...], totalCount, ... }
        this.readers = response.data.docgias || []
        console.log('Loaded readers:', this.readers.length, 'of', response.data.totalCount)
      } catch (error) {
        console.error('Error fetching readers:', error)
        alert('Không thể tải danh sách độc giả')
      }
    },
    showAddForm() {
      this.isEditing = false
      this.showForm = true
      const today = new Date().toISOString().split('T')[0]
      const nextYear = new Date()
      nextYear.setFullYear(nextYear.getFullYear() + 1)

      this.readerForm = {
        MaDocGia: '',
        HoTen: '',
        NgaySinh: '',
        DiaChi: '',
        Email: '',
        SoDienThoai: '',
        NgayDangKy: today,
        NgayHetHan: nextYear.toISOString().split('T')[0],
        TrangThai: 'Hoạt động',
      }
    },
    editReader(reader) {
      this.isEditing = true
      this.showForm = true
      this.readerForm = {
        ...reader,
        NgaySinh: new Date(reader.NgaySinh).toISOString().split('T')[0],
        NgayDangKy: new Date(reader.NgayDangKy).toISOString().split('T')[0],
        NgayHetHan: new Date(reader.NgayHetHan).toISOString().split('T')[0],
      }
    },
    async submitForm() {
      try {
        if (this.isEditing) {
          await axios.put(`/docgia/${this.readerForm.MaDocGia}`, this.readerForm)
          alert('Cập nhật độc giả thành công!')
        } else {
          await axios.post('/docgia', this.readerForm)
          alert('Thêm độc giả mới thành công!')
        }
        this.showForm = false
        this.fetchReaders()
      } catch (error) {
        console.error('Error submitting form:', error)
        alert('Có lỗi xảy ra khi lưu thông tin độc giả')
      }
    },
    async deleteReader(maDocGia) {
      if (!confirm('Bạn có chắc muốn xóa độc giả này?')) return

      try {
        await axios.delete(`/docgia/${maDocGia}`)
        alert('Xóa độc giả thành công!')
        this.fetchReaders()
      } catch (error) {
        console.error('Error deleting reader:', error)
        alert('Không thể xóa độc giả')
      }
    },
    cancelForm() {
      this.showForm = false
    },
  },
  mounted() {
    this.fetchReaders()
  },
}
</script>

<style scoped>
.search-input,
.form-input {
  width: 100%;
  padding: 0.5rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  outline: none;
  transition: all 0.3s;
}

.search-input:focus,
.form-input:focus {
  border-color: #60a5fa;
  box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.2);
}
</style>
