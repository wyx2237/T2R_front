<script setup lang="ts">
import { computed } from 'vue'
import AppHeader from './AppHeader.vue'
import AppSidebar from './AppSidebar.vue'
import { useUiStore } from '@/stores/ui'

const uiStore = useUiStore()

const mainStyle = computed(() => ({
  marginLeft: uiStore.sidebarCollapsed ? '64px' : '220px',
  marginTop: '56px',
}))
</script>

<template>
  <div class="app-layout">
    <AppHeader />
    <AppSidebar />
    <main class="main-content" :style="mainStyle">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.app-layout {
  min-height: 100vh;
  background: #F5F7FA;
}

.main-content {
  padding: 20px;
  transition: margin-left 0.3s;
  min-height: calc(100vh - 56px);
}
</style>
