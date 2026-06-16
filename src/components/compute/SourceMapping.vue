<script setup lang="ts">
import type { StepTrace } from '@/types/compute'

defineProps<{
  inputSource: StepTrace['inputSource']
}>()
</script>

<template>
  <div class="source-mapping">
    <div
      v-for="(source, key) in inputSource"
      :key="key"
      class="source-row"
    >
      <span class="source-key">{{ key }}</span>
      <el-tag
        :type="source.sourceType === 'raw' ? '' : 'success'"
        size="small"
      >
        {{ source.sourceLabel }}
      </el-tag>
    </div>
  </div>
</template>

<style scoped>
.source-mapping {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.source-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.source-key {
  font-size: 13px;
  font-weight: 500;
  color: #606266;
  min-width: 60px;
}
</style>
