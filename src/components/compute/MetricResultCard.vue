<script setup lang="ts">
import { computed } from 'vue'
import type { MetricComputeResult } from '@/types/compute'
import ResultValue from './ResultValue.vue'
import StepTracePanel from './StepTracePanel.vue'

const props = defineProps<{
  result: MetricComputeResult
}>()

const emit = defineEmits<{
  (e: 'tool-click', toolId: string): void
}>()

const statusTagType = computed(() => {
  switch (props.result.status) {
    case 'normal': return 'success'
    case 'borderline': return 'warning'
    case 'abnormal': return 'danger'
    default: return 'info'
  }
})
</script>

<template>
  <div class="metric-result-card">
    <div class="result-header">
      <span class="result-metric-name">{{ result.metricName }}</span>
      <el-tag
        v-if="result.status && result.statusLabel"
        :type="statusTagType"
        size="small"
        effect="plain"
      >
        {{ result.statusLabel }}
      </el-tag>
    </div>

    <ResultValue
      :value="result.finalValue"
      :unit="result.finalUnit"
      :status="result.status"
    />

    <div v-if="result.referenceRange" class="reference-range">
      Reference: {{ result.referenceRange.min }} — {{ result.referenceRange.max }}
      {{ result.finalUnit }}
    </div>

    <el-divider />

    <StepTracePanel
      :steps="result.steps"
      @tool-click="(toolId: string) => emit('tool-click', toolId)"
    />
  </div>
</template>

<style scoped>
.metric-result-card {
  background: #fff;
  border: 1px solid #E8E8E8;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.metric-result-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.result-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.result-metric-name {
  font-size: 20px;
  font-weight: 700;
  color: #303133;
}

.reference-range {
  text-align: center;
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
}
</style>
