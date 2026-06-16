<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <header class="app-header">
    <div class="header-left" @click="router.push('/')">
      <span class="logo">⚕</span>
      <span class="title">Clinical Quantitative Platform</span>
    </div>
    <div class="header-right">
      <el-badge :value="3" :max="99" class="notification-badge">
        <el-icon :size="20"><Bell /></el-icon>
      </el-badge>
      <el-avatar :size="32" icon="UserFilled" class="avatar" />
    </div>
  </header>
</template>

<style scoped>
.app-header {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background: #FFFFFF;
  border-bottom: 1px solid #E8E8E8;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.logo {
  font-size: 24px;
}

.title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.notification-badge {
  cursor: pointer;
}

.avatar {
  cursor: pointer;
}
</style>
