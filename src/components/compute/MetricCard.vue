<script setup lang="ts">
import type { Metric } from '@/types/metric'

const props = defineProps<{
  metric: Metric
  selected: boolean
  allParams: string[]
}>()

const emit = defineEmits<{
  (e: 'select', metricId: string): void
}>()

function handleClick() {
  emit('select', props.metric.id)
}
</script>

<template>
  <el-card
    class="metric-card"
    :class="{ selected }"
    shadow="hover"
    @click="handleClick"
  >
    <div class="card-body">
      <div class="card-name">{{ metric.name }}</div>
      <div class="card-meta">
        <span>{{ metric.department }}</span>
        <span class="meta-sep">&middot;</span>
        <span>{{ metric.steps.length }} compute step{{ metric.steps.length > 1 ? 's' : '' }}</span>
      </div>
      <div class="card-params">
        <span
          v-for="inputName in allParams"
          :key="inputName"
          class="param-tag"
        >{{ inputName }}</span>
      </div>
    </div>
  </el-card>
</template>

<style scoped>
.metric-card {
  cursor: pointer;
  border-left: 4px solid var(--claude-border);
  transition: border-color 0.2s, box-shadow 0.2s;
}

.metric-card.selected {
  border-color: #D97757;
  background: var(--el-color-primary-light-9);
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.card-name {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}

.card-meta {
  font-size: 12px;
  color: #909399;
}

.meta-sep {
  margin: 0 6px;
}

.card-params {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.param-tag {
  display: inline-flex;
  align-items: center;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
  background: #F5F5F5;
  color: #909399;
}
</style>
