<script setup lang="ts">
import type { ExtractedParam } from '@/types/compute'
import HighlightedText from './HighlightedText.vue'
import { useScrollTo } from '@/composables/useScrollTo'

const props = defineProps<{
  rawText: string
  params: ExtractedParam[]
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const { scrollToId, scrollToElement } = useScrollTo()

function handleParamClick(paramName: string) {
  // Scroll to table row
  scrollToId(`param-row-${paramName}`)
}

function handleRowClick(paramName: string) {
  // Scroll to mark in text
  scrollToElement(`mark[data-param="${paramName}"]`)
}

function confidenceColor(conf: number): string {
  if (conf >= 4) return '#52C41A'
  if (conf >= 2) return '#FAAD14'
  return '#FF4D4F'
}
</script>

<template>
  <div v-if="modelValue" class="extraction-highlight">
      <!-- Highlighted Text -->
      <HighlightedText
        :text="rawText"
        :params="params"
        @param-click="handleParamClick"
      />

      <!-- Detail Table -->
      <el-table
        :data="params"
        size="small"
        stripe
        class="detail-table"
        @row-click="(row: ExtractedParam) => handleRowClick(row.name)"
      >
        <el-table-column prop="name" label="Parameter Name" width="130">
          <template #default="{ row }">
            <span :id="`param-row-${row.name}`" class="table-param-name">
              {{ row.name }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="rawValue" label="Raw Value" min-width="120" />
        <el-table-column label="Normalized" width="130">
          <template #default="{ row }">
            {{ row.normalizedValue }}
          </template>
        </el-table-column>
        <el-table-column prop="unit" label="Unit" width="80">
          <template #default="{ row }">{{ row.unit || '-' }}</template>
        </el-table-column>
        <el-table-column label="Confidence" width="140">
          <template #default="{ row }">
            <div class="confidence-dots">
              <span
                v-for="i in 5"
                :key="i"
                class="dot"
                :class="{ filled: i <= row.confidence }"
                :style="i <= row.confidence ? { background: confidenceColor(row.confidence) } : {}"
              />
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div class="extraction-footer">
        <span class="param-count">{{ params.length }} parameters extracted</span>
      </div>
    </div>
</template>

<style scoped>
.detail-table {
  margin-top: 12px;
  cursor: pointer;
}

.table-param-name {
  color: #D97757;
  font-weight: 500;
}

.extraction-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
}

.param-count {
  font-size: 13px;
  color: #909399;
}

.confidence-dots {
  display: flex;
  gap: 4px;
  align-items: center;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--claude-border);
  display: inline-block;
}

.dot.filled {
  background: #52C41A;
}

</style>
