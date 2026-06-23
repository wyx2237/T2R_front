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
      background-color="#E5D8C2"
      text-color="#3C2A1E"
      active-text-color="#D97757"
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
        <template #title>Indicators</template>
      </el-menu-item>
      <el-menu-item index="/compute/upload">
        <el-icon><Operation /></el-icon>
        <template #title>Calculation</template>
      </el-menu-item>
      <el-menu-item index="/tools">
        <el-icon><SetUp /></el-icon>
        <template #title>Tools</template>
      </el-menu-item>
    </el-menu>
    <div class="collapse-btn" @click="uiStore.toggleSidebar()">
      <el-icon :size="20">
        <DArrowLeft v-if="!uiStore.sidebarCollapsed" />
        <DArrowRight v-else />
      </el-icon>
    </div>
  </aside>
</template>

<style scoped>
.app-sidebar {
  width: 220px;
  background: var(--claude-sidebar-bg);
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
  padding-top: 8px;
}

/* ── Menu Item Sizing ── */
.sidebar-menu :deep(.el-menu-item) {
  height: 52px;
  line-height: 52px;
  padding: 0 20px;
  margin: 2px 10px;
  border-radius: 8px;
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.3px;
  transition: all 0.3s ease, opacity 0.3s ease, visibility 0.3s ease;
  position: relative;
}

/* ── Icon Size ── */
.sidebar-menu :deep(.el-menu-item .el-icon) {
  font-size: 22px;
  width: 24px;
  margin-right: 10px;
}

/* ── Collapsed State: hide all menu items ── */
.app-sidebar.collapsed :deep(.el-menu-item) {
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  height: 0;
  padding-top: 0;
  padding-bottom: 0;
  margin-top: 0;
  margin-bottom: 0;
  overflow: hidden;
  border: none;
}

/* ── Active Item ── */
.sidebar-menu :deep(.el-menu-item.is-active) {
  background-color: var(--el-color-primary-light-9) !important;
  border-left: 3px solid var(--claude-orange);
  padding-left: 17px; /* 20px - 3px border */
}

/* ── Hover State ── */
.sidebar-menu :deep(.el-menu-item:hover) {
  background-color: var(--claude-sidebar-hover) !important;
}

/* ── Active + Hover override ── */
.sidebar-menu :deep(.el-menu-item.is-active:hover) {
  background-color: var(--el-color-primary-light-9) !important;
}

/* ── Collapse Button ── */
.collapse-btn {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--claude-sidebar-text);
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  transition: color 0.2s;
}

.collapse-btn:hover {
  color: var(--claude-orange);
}
</style>
