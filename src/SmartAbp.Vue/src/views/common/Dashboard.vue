<template>
  <EnterpriseLayout>
    <DashboardView :userInfo="userInfo" />
  </EnterpriseLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import EnterpriseLayout from '@/components/EnterpriseLayout.vue'
import DashboardView from '@/components/DashboardView.vue'

const authStore = useAuthStore()

const userInfo = computed(() => authStore.userInfo || {
  id: '1',
  username: 'admin',
  email: 'admin@example.com',
  roles: ['admin']
})
</script>
