<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import type { WorkflowStep } from '@/types/metric'

const props = defineProps<{
  steps: WorkflowStep[]
}>()

const pipelineRef = ref<HTMLDivElement | null>(null)
const nodeRefs = ref<(HTMLDivElement | null)[]>([])
const svgWidth = ref(0)
const svgHeight = ref(100)
const lines = ref<{ x1: number; y1: number; x2: number; y2: number }[]>([])

function recalculateLines() {
  if (!pipelineRef.value || props.steps.length < 2) {
    lines.value = []
    return
  }

  const containerRect = pipelineRef.value.getBoundingClientRect()
  const newLines: { x1: number; y1: number; x2: number; y2: number }[] = []

  for (let i = 0; i < props.steps.length - 1; i++) {
    const currentNode = nodeRefs.value[i]
    const nextNode = nodeRefs.value[i + 1]
    if (!currentNode || !nextNode) continue

    const currentRect = currentNode.getBoundingClientRect()
    const nextRect = nextNode.getBoundingClientRect()

    newLines.push({
      x1: currentRect.right - containerRect.left,
      y1: currentRect.top + currentRect.height / 2 - containerRect.top,
      x2: nextRect.left - containerRect.left,
      y2: nextRect.top + nextRect.height / 2 - containerRect.top,
    })
  }

  lines.value = newLines
}

const isVertical = ref(false)

function checkLayout() {
  isVertical.value = props.steps.length > 5
  svgWidth.value = pipelineRef.value?.clientWidth || 800
  nextTick(recalculateLines)
}

let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  checkLayout()
  resizeObserver = new ResizeObserver(() => checkLayout())
  if (pipelineRef.value) {
    resizeObserver.observe(pipelineRef.value)
  }
})

onUnmounted(() => {
  resizeObserver?.disconnect()
})

watch(() => props.steps, () => nextTick(checkLayout))
</script>

<template>
  <div
    ref="pipelineRef"
    class="pipeline"
    :class="{ 'pipeline-vertical': isVertical }"
  >
    <svg
      v-if="lines.length > 0"
      class="pipeline-svg"
      :width="svgWidth"
      :height="svgHeight"
    >
      <line
        v-for="(line, i) in lines"
        :key="i"
        :x1="line.x1"
        :y1="line.y1"
        :x2="line.x2"
        :y2="line.y2"
        stroke="#D9D9D9"
        stroke-width="2"
      />
      <polygon
        v-for="(line, i) in lines"
        :key="'arrow-' + i"
        :points="`${line.x2 - 6},${line.y2 - 4} ${line.x2},${line.y2} ${line.x2 - 6},${line.y2 + 4}`"
        fill="#D9D9D9"
      />
    </svg>
    <div class="pipeline-nodes">
      <div
        v-for="(step, i) in steps"
        :key="step.step_id"
        :ref="(el) => { nodeRefs[i] = el as HTMLDivElement | null }"
        class="step-node"
      >
        <div class="step-circle">{{ step.step_id }}</div>
        <div class="step-info">
          <span class="step-name">{{ step.step_name }}</span>
          <span class="step-desc">{{ step.step_description }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pipeline {
  position: relative;
  padding: 24px 0;
}

.pipeline-svg {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
}

.pipeline-nodes {
  display: flex;
  align-items: flex-start;
  justify-content: space-around;
  gap: 16px;
}

.pipeline-vertical .pipeline-nodes {
  flex-direction: column;
  align-items: center;
}

.step-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  min-width: 140px;
  position: relative;
  z-index: 1;
}

.step-circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #409EFF;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  flex-shrink: 0;
}

.step-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.step-name {
  font-size: 13px;
  font-weight: 600;
  color: #303133;
  text-align: center;
}

.step-desc {
  color: #909399;
  font-size: 12px;
  text-align: center;
  max-width: 160px;
}
</style>
