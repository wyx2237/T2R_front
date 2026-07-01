<script setup lang="ts">
import { ref, computed } from 'vue'
import type { StepTrace } from '@/types/compute'

const props = defineProps<{
  trace: StepTrace
}>()

const emit = defineEmits<{
  (e: 'tool-click', category: string): void
}>()

const expanded = ref(false)

function toggleExpand() {
  expanded.value = !expanded.value
}

function formatSource(source: string): string {
  // $|inputs|.xxx → Raw Text - xxx
  const inputsMatch = source.match(/^\$\|inputs\|\.(.+)$/)
  if (inputsMatch) return `Raw Text - ${inputsMatch[1]}`
  // $|<number>|.xxx → Step <number> - xxx
  const stepNumMatch = source.match(/^\$\|(\d+)\|\.(.+)$/)
  if (stepNumMatch) return `Step ${stepNumMatch[1]} - ${stepNumMatch[2]}`
  // $|step<number>|.xxx → Step <number> - xxx
  const stepStrMatch = source.match(/^\$\|step(\d+)\|\.(.+)$/)
  if (stepStrMatch) return `Step ${stepStrMatch[1]} - ${stepStrMatch[2]}`
  return source
}
</script>

<template>
  <div class="step-node">
    <div class="step-header" @click="toggleExpand">
      <div class="step-header-left">
        <span class="step-number">Step {{ trace.order }}</span>
        <span class="step-name">{{ trace.step_name }}</span>
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
        <span class="expand-label">{{ expanded ? 'Collapse' : 'Expand' }}</span>
        <el-icon class="expand-icon" :class="{ expanded }">
          <ArrowDown />
        </el-icon>
      </div>
    </div>

    <div v-if="expanded" class="step-body">
      <!-- Category -->
      <div class="category-row">
        <span class="section-label">CATEGORY</span>
        <el-tag
          class="category-tag"
          size="small"
          type="info"
          effect="plain"
          @click.stop="emit('tool-click', trace.category)"
        >
          {{ trace.category }}
        </el-tag>
      </div>

      <!-- Description -->
      <div class="step-section">
        <div class="section-label">Description</div>
        <p class="desc-text">{{ trace.step_description }}</p>
      </div>

      <!-- Logic (step_detail) -->
      <div class="step-section">
        <div class="section-label">LOGIC</div>
        <p class="logic-text">{{ trace.step_detail }}</p>
      </div>

      <!-- Inputs -->
      <div class="step-section">
        <div class="section-label">Inputs</div>
        <div class="input-cards">
          <div
            v-for="item in trace.inputs"
            :key="item.input_name"
            class="input-card"
          >
            <div class="input-card-left">
              <span class="input-param-name">{{ item.input_name }}</span>
              <span class="input-param-value">{{ item.input_value }}</span>
              <span class="input-param-unit">{{ item.input_unit }}</span>
            </div>
            <el-tag
              v-if="item.input_source"
              :type="item.input_source.includes('inputs') ? '' : 'success'"
              size="small"
            >
              <span class="from-label">from</span>
              {{ formatSource(item.input_source) }}
            </el-tag>
          </div>
        </div>
      </div>

      <!-- Outputs -->
      <div class="step-section">
        <div class="section-label">Outputs</div>
        <div class="output-cards">
          <div
            v-for="item in trace.outputs"
            :key="item.output_name"
            class="output-card"
          >
            <span class="output-name">{{ item.output_name }}</span>
            <span class="output-value">{{ item.output_value }}</span>
            <span v-if="item.output_unit" class="output-unit">{{ item.output_unit }}</span>
          </div>
        </div>
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

.expand-icon {
  transition: transform 0.2s;
  font-size: 14px;
}

.expand-icon.expanded {
  transform: rotate(180deg);
}

.expand-label {
  font-size: 12px;
  color: #909399;
  font-weight: 500;
  user-select: none;
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

.desc-text {
  font-size: 13px;
  color: #606266;
  margin: 0;
  line-height: 1.6;
}

.logic-text {
  font-size: 13px;
  color: #D97757;
  margin: 0;
  line-height: 1.6;
  background: #FEF6F0;
  padding: 10px 14px;
  border-radius: 6px;
  border-left: 3px solid #D97757;
  font-weight: 500;
}

.category-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.category-tag {
  cursor: pointer;
  transition: opacity 0.15s;
}

.category-tag:hover {
  opacity: 0.7;
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

.input-param-unit {
  font-size: 12px;
  color: #909399;
}

.from-label {
  font-size: 10px;
  color: #999;
  margin-right: 2px;
  font-weight: 400;
}

.output-cards {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.output-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: #FAFAFA;
  border: 1px solid #EEE;
  border-radius: 6px;
}

.output-name {
  font-size: 13px;
  font-weight: 600;
  color: #606266;
  min-width: 60px;
}

.output-value {
  font-size: 14px;
  color: #303133;
  font-family: 'SF Monaco', 'Fira Code', monospace;
  font-weight: 600;
}

.output-unit {
  font-size: 12px;
  color: #909399;
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
