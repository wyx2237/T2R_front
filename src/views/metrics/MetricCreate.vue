<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div class="placeholder-page">
    <div class="page-header">
      <el-button text @click="router.push('/metrics')">
        <el-icon><ArrowLeft /></el-icon>
        Back to List
      </el-button>
    </div>
    <el-result
      icon="info"
      title="Create New Metric"
      sub-title="Metric creation will be available in a future release."
    />
  </div>
</template>

<style scoped>
.placeholder-page {
  max-width: 1200px;
  margin: 0 auto;
}
.page-header {
  margin-bottom: 16px;
}
</style>
