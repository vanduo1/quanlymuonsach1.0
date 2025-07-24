<template>
  <div class="flex flex-col justify-center items-center h-screen text-center bg-c1">
    <div class="text-c3 mb-6">
      <h1 class="text-3xl font-bold mb-4">Chào mừng đến với hệ thống Quản lý Mượn Sách</h1>
      <p class="text-lg mb-6">
        Dễ dàng quản lý sách, độc giả, nhân viên và quá trình mượn trả sách.
      </p>
    </div>

    <div class="flex flex-wrap justify-center gap-4 text-red-800 font-bold">
      <router-link
        to="/books"
        class="border-4 rounded-full py-3 px-7 border-c3 hover:bg-c3 hover:text-c1 transition ease-in-out duration-300"
      >
        <i class="fa-solid fa-book"></i> Quản lý Sách
      </router-link>
      <router-link
        to="/borrows"
        class="border-4 rounded-full py-3 px-7 border-c3 hover:bg-c3 hover:text-c1 transition ease-in-out duration-300"
      >
        <i class="fa-solid fa-calendar-week"></i> Theo dõi Mượn Sách
      </router-link>
      <router-link
        to="/publishers"
        class="border-4 rounded-full py-3 px-7 border-c3 hover:bg-c3 hover:text-c1 transition ease-in-out duration-300"
      >
        <i class="fa-solid fa-building"></i> Nhà Xuất Bản
      </router-link>
      <router-link
        to="/readers"
        class="border-4 rounded-full py-3 px-7 border-c3 hover:bg-c3 hover:text-c1 transition ease-in-out duration-300"
      >
        <i class="fa-solid fa-book-open-reader"></i> Độc Giả
      </router-link>
      <router-link
        to="/staff"
        class="border-4 rounded-full py-3 px-7 border-c3 hover:bg-c3 hover:text-c1 transition ease-in-out duration-300"
      >
        <i class="fa-solid fa-clipboard-user"></i> Nhân Viên
      </router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Home',
}
</script>

<style scoped>
.btn {
  @apply bg-blue-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-700 transition;
}
</style>
