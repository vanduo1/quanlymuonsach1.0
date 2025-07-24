<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6">Quản lý nhà xuất bản</h1>

    <!-- Thanh tìm kiếm -->
    <div class="mb-6">
      <input
        type="text"
        v-model="searchQuery"
        placeholder="Tìm kiếm nhà xuất bản..."
        class="search-input"
      />
    </div>

    <!-- Bảng hiển thị nhà xuất bản -->
    <div class="bg-white shadow-md rounded-lg overflow-hidden mb-6">
      <table class="min-w-full">
        <thead class="bg-gray-100">
          <tr>
            <th class="py-3 px-6 text-left">Mã NXB</th>
            <th class="py-3 px-6 text-left">Tên NXB</th>
            <th class="py-3 px-6 text-left">Địa chỉ</th>
            <th class="py-3 px-6 text-left">Email</th>
            <th class="py-3 px-6 text-left">Số điện thoại</th>
            <th class="py-3 px-6 text-center">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="publisher in filteredPublishers"
            :key="publisher.MaNXB"
            class="border-b hover:bg-gray-50"
          >
            <td class="py-3 px-6 text-left">{{ publisher.MaNXB }}</td>
            <td class="py-3 px-6 text-left">{{ publisher.TenNXB }}</td>
            <td class="py-3 px-6 text-left">{{ publisher.DiaChi }}</td>
            <td class="py-3 px-6 text-left">{{ publisher.Email }}</td>
            <td class="py-3 px-6 text-left">{{ publisher.SoDienThoai }}</td>
            <td class="py-3 px-6 text-center">
              <button
                @click="editPublisher(publisher)"
                class="text-blue-600 hover:text-blue-800 mr-3"
              >
                Sửa
              </button>
              <button
                @click="deletePublisher(publisher.MaNXB)"
                class="text-red-600 hover:text-red-800"
              >
                Xóa
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Form thêm/sửa nhà xuất bản -->
    <div v-if="showForm" class="bg-white shadow-md rounded-lg p-6">
      <h2 class="text-xl font-bold mb-4">
        {{ isEditing ? 'Sửa nhà xuất bản' : 'Thêm nhà xuất bản mới' }}
      </h2>
      <form @submit.prevent="submitForm" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Mã NXB</label>
          <input
            type="text"
            v-model="publisherForm.MaNXB"
            required
            :disabled="isEditing"
            class="form-input"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Tên NXB</label>
          <input type="text" v-model="publisherForm.TenNXB" required class="form-input" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Địa chỉ</label>
          <input type="text" v-model="publisherForm.DiaChi" required class="form-input" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Email</label>
          <input type="email" v-model="publisherForm.Email" required class="form-input" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Số điện thoại</label>
          <input type="tel" v-model="publisherForm.SoDienThoai" required class="form-input" />
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
      Thêm nhà xuất bản mới
    </button>
  </div>
</template>

<script>
import axios from '../utils/axiosInstance'

export default {
  name: 'Publishers',
  data() {
    return {
      publishers: [],
      searchQuery: '',
      showForm: false,
      isEditing: false,
      publisherForm: {
        MaNXB: '',
        TenNXB: '',
        DiaChi: '',
        Email: '',
        SoDienThoai: '',
      },
    }
  },
  computed: {
    filteredPublishers() {
      const query = this.searchQuery.toLowerCase()
      return this.publishers.filter(
        (publisher) =>
          publisher.MaNXB.toLowerCase().includes(query) ||
          publisher.TenNXB.toLowerCase().includes(query) ||
          publisher.DiaChi.toLowerCase().includes(query),
      )
    },
  },
  methods: {
    async fetchPublishers() {
      try {
        const response = await axios.get('/nhaxuatban')
        this.publishers = response.data
      } catch (error) {
        console.error('Error fetching publishers:', error)
        alert('Không thể tải danh sách nhà xuất bản')
      }
    },
    showAddForm() {
      this.isEditing = false
      this.showForm = true
      this.publisherForm = {
        MaNXB: '',
        TenNXB: '',
        DiaChi: '',
        Email: '',
        SoDienThoai: '',
      }
    },
    editPublisher(publisher) {
      this.isEditing = true
      this.showForm = true
      this.publisherForm = { ...publisher }
    },
    async submitForm() {
      try {
        // Validation
        if (!this.publisherForm.MaNXB || !this.publisherForm.TenNXB) {
          alert('Mã NXB và Tên NXB là bắt buộc')
          return
        }

        if (this.isEditing) {
          await axios.put(`/nhaxuatban/${this.publisherForm.MaNXB}`, this.publisherForm)
          alert('Cập nhật nhà xuất bản thành công!')
        } else {
          await axios.post('/nhaxuatban', this.publisherForm)
          alert('Thêm nhà xuất bản mới thành công!')
        }
        this.showForm = false
        this.fetchPublishers()
      } catch (error) {
        console.error('Error submitting form:', error)
        if (error.response && error.response.data && error.response.data.message) {
          alert(error.response.data.message)
        } else {
          alert('Có lỗi xảy ra khi lưu thông tin nhà xuất bản')
        }
      }
    },
    async deletePublisher(maNXB) {
      if (!confirm('Bạn có chắc muốn xóa nhà xuất bản này?')) return

      try {
        await axios.delete(`/nhaxuatban/${maNXB}`)
        alert('Xóa nhà xuất bản thành công!')
        this.fetchPublishers()
      } catch (error) {
        console.error('Error deleting publisher:', error)
        alert('Không thể xóa nhà xuất bản')
      }
    },
    cancelForm() {
      this.showForm = false
    },
  },
  mounted() {
    this.fetchPublishers()
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
