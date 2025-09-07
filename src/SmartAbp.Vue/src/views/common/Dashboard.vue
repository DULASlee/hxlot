<template>
  <div class="dashboard-wrapper">
    <DashboardView :userInfo="userInfo" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores'
import DashboardView from '@/components/common/DashboardView.vue'

const authStore = useAuthStore()

const userInfo = computed(() => authStore.userInfo || {
  id: '1',
  username: 'admin',
  email: 'admin@example.com',
  roles: ['admin']
})
</script>

<style scoped>
.dashboard-wrapper {
  padding: var(--spacing-4);
  background: var(--theme-bg-component);
  min-height: 100vh;
}
</style>
