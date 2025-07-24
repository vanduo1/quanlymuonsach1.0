<template>
  <div class="p-32">
    <h1 class="text-3xl font-bold text-gray-800 mb-4 text-center">
      <i class="fa-solid fa-users"></i> Danh Sách Nhân Viên
    </h1>

    <!-- Thanh tìm kiếm -->
    <input
      v-model="searchQuery"
      type="text"
      placeholder="🔎 Tìm kiếm theo Mã NV hoặc Họ Tên..."
      class="input m-4 w-full p-3 rounded-full"
    />

    <!-- Nút tải danh sách nhân viên -->
    <button
      @click="fetchStaffs"
      class="font-extrabold my-4 mx-8 p-2 border-2 rounded-full py-2 px-5 border-c3 hover:bg-c3 hover:text-c1 transition ease-in-out duration-300"
    >
      <i class="fa-solid fa-rotate pr-4"></i>Tải danh sách
    </button>

    <!-- Chỉ Admin mới được thêm nhân viên -->
    <button
      @click="openModal"
      class="font-extrabold text-c4 my-4 p-2 border-2 rounded-full py-2 px-5 border-c4 hover:bg-c4 hover:text-white transition ease-in-out duration-300"
    >
      <i class="fa-solid fa-plus"></i> Thêm Nhân Viên
    </button>

    <!-- Bảng hiển thị nhân viên -->
    <div class="overflow-x-auto m-8">
      <table class="w-full border border-gray-300 shadow-md rounded-lg overflow-hidden">
        <thead>
          <tr class="bg-c1 text-c3 font-extrabold uppercase text-sm leading-normal">
            <th class="py-3 px-6 text-left">Mã NV</th>
            <th class="py-3 px-6 text-left">Họ Tên</th>
            <th class="py-3 px-6 text-center">Chức Vụ</th>
            <th class="py-3 px-6 text-center">Địa chỉ</th>
            <th class="py-3 px-6 text-center">Số Điện Thoại</th>

            <th class="py-3 px-6 text-center">Hành động</th>
          </tr>
        </thead>
        <tbody class="text-gray-700 text-sm font-normal">
          <tr
            v-for="staff in filteredStaffs"
            :key="staff.MSNV"
            class="border-b border-gray-200 hover:bg-gray-100 transition duration-200"
          >
            <td class="py-3 px-6 text-left">{{ staff.MSNV }}</td>
            <td class="py-3 px-6 text-left">{{ staff.HoTenNV }}</td>
            <td class="py-3 px-6 text-center">{{ staff.ChucVu }}</td>
            <td class="py-3 px-6 text-center">{{ staff.DiaChi }}</td>
            <td class="py-3 px-6 text-center">{{ staff.SoDienThoai }}</td>
            <td class="py-3 px-6 text-center">
              <button
                @click="editStaff(staff)"
                class="text-c3 font-bold hover:text-blue-700 mx-2 border-2 p-2 rounded-2xl"
              >
                ✏ Sửa
              </button>
              <button
                @click="deleteStaff(staff.MSNV)"
                class="text-red-700 font-bold hover:text-red-400 mx-2 p-2 border-2 rounded-2xl"
              >
                🗑 Xóa
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Form thêm / sửa nhân viên -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4"
    >
      <div class="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md">
        <h2 class="text-2xl font-bold mb-6 text-center text-gray-800">
          {{ isEditing ? 'Chỉnh Sửa Nhân Viên' : 'Thêm Nhân Viên' }}
        </h2>
        <div class="space-y-4">
          <!-- Mã NV sẽ được tự tạo bởi hệ thống khi thêm mới -->
          <div class="relative" v-if="isEditing">
            <label class="block text-gray-700 font-semibold">Mã NV</label>
            <input
              v-model="newStaff.MSNV"
              type="text"
              placeholder="Mã NV"
              class="input-field"
              readonly
              disabled
            />
          </div>
          <div class="relative">
            <label class="block text-gray-700 font-semibold">Họ Tên *</label>
            <input
              v-model="newStaff.HoTenNV"
              type="text"
              placeholder="Nhập họ tên nhân viên"
              class="input-field"
              required
            />
          </div>
          <div class="relative">
            <label class="block text-gray-700 font-semibold">Email *</label>
            <input
              v-model="newStaff.Email"
              type="email"
              placeholder="Nhập email (VD: nhanvien@example.com)"
              class="input-field"
              required
            />
          </div>
          <div class="relative" v-if="!isEditing">
            <label class="block text-gray-700 font-semibold">Mật khẩu *</label>
            <input
              v-model="newStaff.Password"
              type="password"
              placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
              class="input-field"
              required
              minlength="6"
            />
          </div>
          <div class="relative">
            <label class="block text-gray-700 font-semibold">Chức Vụ *</label>
            <select v-model="newStaff.ChucVu" class="input-field" required>
              <option value="">-- Chọn chức vụ --</option>
              <option value="Admin">Admin</option>
              <option value="Thủ thư">Thủ thư</option>
            </select>
          </div>
          <div class="relative">
            <label class="block text-gray-700 font-semibold">Địa Chỉ *</label>
            <input
              v-model="newStaff.DiaChi"
              type="text"
              placeholder="Nhập địa chỉ"
              class="input-field"
              required
            />
          </div>
          <div class="relative">
            <label class="block text-gray-700 font-semibold">Số Điện Thoại *</label>
            <input
              v-model="newStaff.SoDienThoai"
              type="text"
              placeholder="Nhập số điện thoại (10-11 chữ số)"
              class="input-field"
              pattern="[0-9]{10,11}"
              required
            />
          </div>
        </div>

        <div class="flex justify-between mt-6">
          <button
            @click="isEditing ? updateStaff() : addStaff()"
            class="bg-c2 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition"
          >
            ✔ Lưu
          </button>
          <button
            @click="closeModal"
            class="bg-red-700 text-white px-4 py-2 rounded-full hover:bg-red-800 transition"
          >
            ✖ Hủy
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from '../utils/axiosInstance'

export default {
  name: 'Staff',
  data() {
    return {
      staffs: [],
      searchQuery: '', // Biến tìm kiếm
      showModal: false,
      isEditing: false,
      newStaff: {
        MSNV: '',
        HoTenNV: '',
        Email: '',
        Password: '',
        ChucVu: '',
        DiaChi: '',
        SoDienThoai: '',
      },
    }
  },
  computed: {
    filteredStaffs() {
      return this.staffs.filter(
        (staff) =>
          staff.MSNV.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          staff.HoTenNV.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          staff.ChucVu.toLowerCase().includes(this.searchQuery.toLowerCase()),
      )
    },
  },
  methods: {
    async fetchStaffs() {
      try {
        const response = await axios.get('/nhanvien')
        this.staffs = response.data
      } catch (error) {
        console.error('Lỗi khi tải danh sách nhân viên:', error)
      }
    },
    async addStaff() {
      try {
        // Validation đầy đủ tất cả trường bắt buộc
        if (
          !this.newStaff.HoTenNV ||
          !this.newStaff.Email ||
          !this.newStaff.Password ||
          !this.newStaff.ChucVu ||
          !this.newStaff.DiaChi ||
          !this.newStaff.SoDienThoai
        ) {
          alert('Vui lòng nhập đầy đủ thông tin nhân viên!')
          return
        }

        // Kiểm tra email hợp lệ
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(this.newStaff.Email)) {
          alert('Email không hợp lệ!')
          return
        }

        // Kiểm tra mật khẩu tối thiểu 6 ký tự
        if (this.newStaff.Password.length < 6) {
          alert('Mật khẩu phải có ít nhất 6 ký tự!')
          return
        }

        // Kiểm tra số điện thoại hợp lệ (10-11 số)
        const phoneRegex = /^[0-9]{10,11}$/
        if (!phoneRegex.test(this.newStaff.SoDienThoai)) {
          alert('Số điện thoại phải có 10-11 chữ số!')
          return
        }

        // Tạo object data để gửi (loại bỏ MSNV vì backend sẽ tự tạo)
        const staffData = {
          HoTenNV: this.newStaff.HoTenNV,
          Email: this.newStaff.Email,
          Password: this.newStaff.Password,
          ChucVu: this.newStaff.ChucVu,
          DiaChi: this.newStaff.DiaChi,
          SoDienThoai: this.newStaff.SoDienThoai,
        }

        const response = await axios.post('/nhanvien', staffData)

        this.fetchStaffs()
        this.closeModal()
        alert(`Thêm nhân viên thành công! Mã nhân viên: ${response.data.MSNV}`)
      } catch (error) {
        console.error('Lỗi khi thêm nhân viên:', error)
        const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi thêm nhân viên!'
        alert(errorMessage)
      }
    },
    async deleteStaff(msnv) {
      if (confirm('Bạn có chắc chắn muốn xóa nhân viên này?')) {
        try {
          await axios.delete(`/nhanvien/${msnv}`)
          this.fetchStaffs()
        } catch (error) {
          console.error('Lỗi khi xóa nhân viên:', error)
        }
      }
    },
    editStaff(staff) {
      this.isEditing = true
      this.newStaff = { ...staff }
      this.showModal = true
    },

    async updateStaff() {
      try {
        // Validation cho chỉnh sửa (không cần Password và Email có thể không thay đổi)
        if (
          !this.newStaff.MSNV ||
          !this.newStaff.HoTenNV ||
          !this.newStaff.Email ||
          !this.newStaff.ChucVu ||
          !this.newStaff.DiaChi ||
          !this.newStaff.SoDienThoai
        ) {
          alert('Vui lòng nhập đầy đủ thông tin nhân viên.')
          return
        }

        // Kiểm tra email hợp lệ
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(this.newStaff.Email)) {
          alert('Email không hợp lệ!')
          return
        }

        // Kiểm tra số điện thoại hợp lệ (10-11 số)
        const phoneRegex = /^[0-9]{10,11}$/
        if (!phoneRegex.test(this.newStaff.SoDienThoai)) {
          alert('Số điện thoại phải có 10-11 chữ số!')
          return
        }

        const updatedStaff = {
          HoTenNV: this.newStaff.HoTenNV,
          Email: this.newStaff.Email,
          ChucVu: this.newStaff.ChucVu,
          DiaChi: this.newStaff.DiaChi,
          SoDienThoai: this.newStaff.SoDienThoai,
        }

        await axios.put(`/nhanvien/${this.newStaff.MSNV}`, updatedStaff)

        this.fetchStaffs()
        this.closeModal()
        alert('Cập nhật nhân viên thành công!')
      } catch (error) {
        console.error('Lỗi khi cập nhật nhân viên:', error)
        const errorMessage =
          error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật nhân viên!'
        alert(errorMessage)
      }
    },
    openModal() {
      this.isEditing = false
      this.newStaff = {
        MSNV: '',
        HoTenNV: '',
        Email: '',
        Password: '',
        ChucVu: '',
        DiaChi: '',
        SoDienThoai: '',
      }
      this.showModal = true
    },
    closeModal() {
      this.showModal = false
    },
  },
  mounted() {
    this.fetchStaffs()
  },
}
</script>

<style scoped>
.input-field {
  width: 100%;
  padding: 0.5rem 1rem;
  border: 1px solid #ccc;
  border-radius: 9999px;
  transition: all 0.2s ease;
}

.input-field:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
}

.input-field:disabled {
  background-color: #f3f4f6;
  color: #6b7280;
  cursor: not-allowed;
}
</style>
