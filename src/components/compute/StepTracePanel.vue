<script setup lang="ts">
import type { StepTrace } from '@/types/compute'
import StepNode from './StepNode.vue'

defineProps<{
  steps: StepTrace[]
}>()

const emit = defineEmits<{
  (e: 'tool-click', toolId: string): void
}>()
</script>

<template>
  <div class="step-trace-panel">
    <StepNode
      v-for="step in steps"
      :key="step.order"
      :trace="step"
      @tool-click="(toolId: string) => emit('tool-click', toolId)"
    />
  </div>
</template>

<style scoped>
.step-trace-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
