<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const metricId = route.params.id as string
</script>

<template>
  <div class="placeholder-page">
    <div class="page-header">
      <el-button text @click="router.push(`/metrics/${metricId}`)">
        <el-icon><ArrowLeft /></el-icon>
        Back to Detail
      </el-button>
    </div>
    <el-result
      icon="info"
      title="Edit Metric"
      :sub-title="`Editing metric '${metricId}' will be available in a future release.`"
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
