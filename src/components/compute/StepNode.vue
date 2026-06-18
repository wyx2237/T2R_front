<script setup lang="ts">
import { ref } from 'vue'
import type { StepTrace } from '@/types/compute'
import { toolAccentColor } from '@/composables/useToolColor'
import CodeBlock from '@/components/shared/CodeBlock.vue'

const props = defineProps<{
  trace: StepTrace
}>()

const emit = defineEmits<{
  (e: 'tool-click', toolId: string): void
}>()

const expanded = ref(false)

function toggleExpand() {
  expanded.value = !expanded.value
}

function handleToolClick() {
  emit('tool-click', props.trace.toolId)
}
</script>

<template>
  <div class="step-node">
    <div class="step-header" @click="toggleExpand">
      <div class="step-header-left">
        <span class="step-number">Step {{ trace.order }}</span>
        <span class="step-name">{{ trace.stepName }}</span>
      </div>
      <div class="step-header-right">
        <span
          v-if="trace.status === 'success'"
          class="step-status-badge status-ok"
        />
        <span
          v-else-if="trace.status === 'error'"
          class="step-status-badge status-fail"
        />
        <el-icon class="expand-icon" :class="{ expanded }">
          <ArrowDown />
        </el-icon>
      </div>
    </div>

    <div v-if="expanded" class="step-body">
      <!-- Tool Name -->
      <div class="step-section">
        <div class="section-label">Tool Name</div>
        <div class="tool-name-row">
          <span
            class="tool-name-text"
            :style="{ borderLeftColor: toolAccentColor(trace.toolId) }"
          >{{ trace.toolName }}</span>
          <el-button text type="primary" size="small" @click="handleToolClick">
            View Tool Details
          </el-button>
        </div>
      </div>

      <!-- Logic -->
      <div class="step-section">
        <div class="section-label">Logic</div>
        <p class="logic-text">{{ trace.description }}</p>
        <div
          v-if="trace.formulaLatex"
          class="formula-latex"
          v-text="trace.formulaLatex"
        />
      </div>

      <!-- Input -->
      <div class="step-section">
        <div class="section-label">Input</div>
        <div class="input-cards">
          <div
            v-for="(value, key) in trace.input"
            :key="key"
            class="input-card"
          >
            <div class="input-card-left">
              <span class="input-param-name">{{ key }}</span>
              <span class="input-param-value">{{ value }}</span>
            </div>
            <el-tag
              v-if="trace.inputSource[key]"
              :type="trace.inputSource[key].sourceType === 'raw' ? '' : 'success'"
              size="small"
            >
              {{ trace.inputSource[key].sourceLabel }}
            </el-tag>
          </div>
        </div>
      </div>

      <!-- Output -->
      <div class="step-section">
        <div class="section-label">Output</div>
        <CodeBlock :code="trace.output" lang="json" />
        <div class="step-status">
          <span v-if="trace.status === 'success'" class="status-success">
            &#10003; Success
          </span>
          <span v-else class="status-error">&#10007; {{ trace.errorMessage }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.step-node {
  border: 1px solid var(--claude-border);
  border-radius: 8px;
  overflow: hidden;
}

.step-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #FAFAFA;
  cursor: pointer;
}

.step-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.step-header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.step-status-badge {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.step-status-badge.status-ok {
  background: #52C41A;
}

.step-status-badge.status-fail {
  background: #FF4D4F;
}

.step-number {
  font-size: 13px;
  font-weight: 600;
  color: var(--claude-text-dark);
  background: var(--claude-warm-bg);
  padding: 2px 10px;
  border-radius: 4px;
}

.step-name {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.tool-name-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.tool-name-text {
  display: inline-block;
  font-size: 14px;
  color: #303133;
  font-weight: 600;
  background: var(--claude-warm-bg);
  padding: 4px 12px 4px 16px;
  border-left: 3px solid #D97757;
  border-radius: 0 4px 4px 0;
}

.expand-icon {
  transition: transform 0.2s;
}

.expand-icon.expanded {
  transform: rotate(180deg);
}

.step-body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.step-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-label {
  font-size: 12px;
  font-weight: 600;
  color: #999;
  text-transform: uppercase;
}

.input-cards {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: #FAFAFA;
  border: 1px solid #EEE;
  border-radius: 6px;
  transition: background 0.15s;
}

.input-card:hover {
  background: var(--claude-warm-bg);
}

.input-card-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.input-param-name {
  font-size: 13px;
  font-weight: 600;
  color: #606266;
  min-width: 60px;
}

.input-param-value {
  font-size: 14px;
  color: #303133;
  font-family: 'SF Mono', 'Fira Code', monospace;
}

.logic-text {
  font-size: 13px;
  color: #606266;
  margin: 0;
  line-height: 1.6;
}

.formula-latex {
  font-size: 14px;
  color: #303133;
  padding: 8px 12px;
  background: var(--claude-warm-bg);
  border-radius: 4px;
  font-family: 'KaTeX_Main', 'Times New Roman', serif;
}

.step-status {
  font-size: 13px;
}

.status-success {
  color: #52C41A;
  font-weight: 500;
}

.status-error {
  color: #FF4D4F;
  font-weight: 500;
}
</style>
