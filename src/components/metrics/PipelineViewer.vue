<script setup lang="ts">
import { computed } from 'vue'
import type { WorkflowStep } from '@/types/metric'

const props = defineProps<{
  steps: WorkflowStep[]
}>()

const COLS = 5

const rows = computed(() => {
  const result: { items: WorkflowStep[]; isReversed: boolean }[] = []
  for (let i = 0; i < props.steps.length; i += COLS) {
    const chunk = props.steps.slice(i, i + COLS)
    const isReversed = result.length % 2 === 1
    result.push({
      items: isReversed ? [...chunk].reverse() : chunk,
      isReversed,
    })
  }
  return result
})
</script>

<template>
  <div class="pipeline">
    <div
      v-for="(row, ri) in rows"
      :key="ri"
      class="pipeline-row"
      :class="{ 'row-reversed': row.isReversed }"
    >
      <div class="row-body">
        <template v-for="(step, si) in row.items" :key="step.step_id">
          <div class="step-node">
            <div class="step-circle">{{ step.step_id }}</div>
            <div class="step-name" :title="step.step_name">{{ step.step_name }}</div>
          </div>
          <div v-if="si < row.items.length - 1" class="h-arrow">&gt;&gt;&gt;</div>
        </template>
      </div>
      <div v-if="ri < rows.length - 1" class="v-turn">
        <div class="v-line" />
        <div class="v-arrow">&#9660;</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pipeline {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  padding: 20px 0 8px;
}

.pipeline-row {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.row-body {
  display: flex;
  align-items: center;
  gap: 0;
}

/* ── Step Node ── */
.step-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  width: 140px;
  flex-shrink: 0;
}

.step-circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #D97757;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  flex-shrink: 0;
}

.step-name {
  font-size: 12px;
  font-weight: 600;
  color: #303133;
  text-align: center;
  white-space: nowrap;
  max-width: 130px;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ── Horizontal Arrow ── */
.h-arrow {
  font-size: 16px;
  color: #D97757;
  font-weight: 800;
  flex-shrink: 0;
  width: 40px;
  text-align: center;
  user-select: none;
  letter-spacing: 1px;
}

/* Reversed row: arrows point left */
.row-reversed .h-arrow {
  transform: scaleX(-1);
}

/* ── Vertical Turn Connector ── */
.v-turn {
  display: flex;
  flex-direction: column;
  align-items: center;
  align-self: flex-end; /* normal L→R rows: turn at right edge */
  margin: 2px 0;
}

.row-reversed .v-turn {
  align-self: flex-start; /* reversed R→L rows: turn at left edge */
}

.v-line {
  width: 2px;
  height: 20px;
  background: #C0C4CC;
}

.v-arrow {
  font-size: 10px;
  color: #C0C4CC;
  line-height: 1;
}
</style>
