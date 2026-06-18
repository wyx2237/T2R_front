<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  value: number
  unit: string
  status?: 'normal' | 'borderline' | 'abnormal'
}>()

const statusColor = computed(() => {
  switch (props.status) {
    case 'normal': return '#52C41A'
    case 'borderline': return '#FAAD14'
    case 'abnormal': return '#FF4D4F'
    default: return '#303133'
  }
})
</script>

<template>
  <div class="result-value">
    <div class="value-main">
      <span class="value-number" :style="{ color: statusColor }">
        {{ value }}
      </span>
      <span class="value-unit">{{ unit }}</span>
    </div>
  </div>
</template>

<style scoped>
.result-value {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px;
  border-radius: 8px;
  background: #fff;
  border: 1px solid var(--claude-border);
}

.value-main {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.value-number {
  font-size: 32px;
  font-weight: 700;
}

.value-unit {
  font-size: 14px;
  color: #909399;
}
</style>
