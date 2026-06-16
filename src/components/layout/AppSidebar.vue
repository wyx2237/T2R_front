<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUiStore } from '@/stores/ui'

const route = useRoute()
const router = useRouter()
const uiStore = useUiStore()

const activeMenu = computed(() => {
  const path = route.path
  if (path === '/') return '/'
  if (path.startsWith('/metrics')) return '/metrics'
  if (path.startsWith('/compute')) return '/compute/upload'
  if (path.startsWith('/tools')) return '/tools'
  return '/'
})

function navigate(path: string) {
  router.push(path)
}
</script>

<template>
  <aside class="app-sidebar" :class="{ collapsed: uiStore.sidebarCollapsed }">
    <el-menu
      :default-active="activeMenu"
      background-color="#1E1F2C"
      text-color="#bfcbd9"
      active-text-color="#409EFF"
      :collapse="uiStore.sidebarCollapsed"
      class="sidebar-menu"
      @select="navigate"
    >
      <el-menu-item index="/">
        <el-icon><HomeFilled /></el-icon>
        <template #title>Home</template>
      </el-menu-item>
      <el-menu-item index="/metrics">
        <el-icon><DataAnalysis /></el-icon>
        <template #title>Metrics</template>
      </el-menu-item>
      <el-menu-item index="/compute/upload">
        <el-icon><Operation /></el-icon>
        <template #title>Compute</template>
      </el-menu-item>
      <el-menu-item index="/tools">
        <el-icon><SetUp /></el-icon>
        <template #title>Tools</template>
      </el-menu-item>
    </el-menu>
    <div class="collapse-btn" @click="uiStore.toggleSidebar()">
      <el-icon :size="18">
        <DArrowLeft v-if="!uiStore.sidebarCollapsed" />
        <DArrowRight v-else />
      </el-icon>
    </div>
  </aside>
</template>

<style scoped>
.app-sidebar {
  width: 220px;
  background: #1E1F2C;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 56px;
  left: 0;
  bottom: 0;
  transition: width 0.3s;
  z-index: 999;
}

.app-sidebar.collapsed {
  width: 64px;
}

.sidebar-menu {
  flex: 1;
  border-right: none;
}

.collapse-btn {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #bfcbd9;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  transition: color 0.2s;
}

.collapse-btn:hover {
  color: #409EFF;
}
</style>
