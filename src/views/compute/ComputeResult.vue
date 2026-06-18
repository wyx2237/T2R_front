<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useComputeStore } from '@/stores/compute'
import { getTools } from '@/api/tools'
import type { AtomicTool } from '@/types/tool'
import ExtractionHighlight from '@/components/compute/ExtractionHighlight.vue'
import MetricResultCard from '@/components/compute/MetricResultCard.vue'
import ComputeSteps from '@/components/compute/ComputeSteps.vue'
import { useClipboard } from '@/composables/useClipboard'
import { exportReport } from '@/api/compute'
import { ElMessage } from 'element-plus'

const router = useRouter()
const computeStore = useComputeStore()
const { copy } = useClipboard()

const stepIndex = ref(2)
const extractionExpanded = ref(true)
const metricsExpanded = ref(true)
const tools = ref<AtomicTool[]>([])
const toolDrawerVisible = ref(false)
const selectedTool = ref<AtomicTool | null>(null)

const computing = ref(true)
const computationDone = ref(false)
const computeError = ref('')

const singleResult = computed(() => computeStore.results[0] ?? null)

const computingSteps = [
  { label: 'Extracting parameters from case text', icon: 'Search' },
  { label: 'Matching parameters to metric inputs', icon: 'Connection' },
  { label: 'Running computation workflow', icon: 'Loading' },
  { label: 'Evaluating results', icon: 'Finished' },
]

function handleToolClick(toolId: string) {
  const tool = tools.value.find((t) => t.id === toolId)
  if (tool) {
    selectedTool.value = tool
    toolDrawerVisible.value = true
  }
}

function handleReSelect() {
  computeStore.backToSelect()
  router.push(`/compute/${computeStore.sessionId}/select`)
}

function handleReset() {
  computeStore.resetToUpload()
  router.push('/compute/upload')
}

async function handleExport() {
  if (!computeStore.sessionId) return
  try {
    const { markdown } = await exportReport(computeStore.sessionId)
    const blob = new Blob([markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'report.md'
    a.click()
    URL.revokeObjectURL(url)
    ElMessage.success('Report exported')
  } catch {
    ElMessage.error('Export failed')
  }
}

function handleCopySummary() {
  if (!singleResult.value) return
  const r = singleResult.value
  const text = `${r.metricName} (${r.metricCode}): ${r.finalValue} ${r.finalUnit}` +
    (r.statusLabel ? ` — ${r.statusLabel}` : '')
  copy(text)
}

onMounted(async () => {
  if (!computeStore.sessionId || !computeStore.selectedMetricId) {
    router.replace('/compute/upload')
    return
  }

  const toolsData = await getTools()
  tools.value = toolsData

  if (computeStore.currentStep === 'result') {
    computing.value = false
    return
  }

  try {
    await new Promise((resolve) => setTimeout(resolve, 3000))
    await computeStore.executeCompute()
    computationDone.value = true // manual dismiss
  } catch {
    computeError.value = 'Computation failed. Please go back and try again.'
    computing.value = false
  }
})
</script>

<template>
  <div class="compute-result-page">
    <ComputeSteps :active="stepIndex" />

    <!-- Loading State -->
    <el-card v-if="computing" class="loading-card">
      <div class="loading-content">
        <div class="spinner-ring">
          <div class="ring-ring" />
          <el-icon :size="36" class="ring-icon"><DataAnalysis /></el-icon>
        </div>
        <h3 class="loading-title">Computing...</h3>
        <p class="loading-subtitle">Please wait while we process your case data</p>
        <div class="loading-steps">
          <div
            v-for="(step, i) in computingSteps"
            :key="i"
            class="loading-step"
          >
            <div class="step-indicator">
              <div class="step-dot" />
              <div v-if="i < computingSteps.length - 1" class="step-line" />
            </div>
            <span class="step-label">{{ step.label }}</span>
          </div>
        </div>
        <el-button
          v-if="computationDone"
          type="primary"
          class="dismiss-btn"
          @click="computing = false"
        >
          View Results
        </el-button>
      </div>
    </el-card>

    <!-- Error State -->
    <el-card v-if="computeError && !computing" class="error-card">
      <div class="error-content">
        <el-icon :size="48" color="#FF4D4F"><CircleCloseFilled /></el-icon>
        <p class="error-message">{{ computeError }}</p>
        <el-button type="primary" @click="handleReSelect">Go Back</el-button>
      </div>
    </el-card>

    <!-- Region 1: Summary -->
    <el-card v-if="singleResult" class="region-card">
      <template #header>
        <div class="region-header">
          <el-icon :size="22"><TrendCharts /></el-icon>
          <span>Summary</span>
        </div>
      </template>

      <div class="single-summary">
        <div class="summary-item">
          <span class="summary-label">Metric</span>
          <span class="summary-value">{{ singleResult.metricName }} ({{ singleResult.metricCode }})</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Result</span>
          <span class="result-cell">
            <span class="status-dot" :class="singleResult.status ? `dot-${singleResult.status}` : ''" />
            <span
              class="result-value-lg"
              :class="singleResult.status ? `status-${singleResult.status}` : ''"
            >
              {{ singleResult.finalValue }}
            </span>
            <span class="result-unit">{{ singleResult.finalUnit }}</span>
          </span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Status</span>
          <el-tag
            v-if="singleResult.status && singleResult.statusLabel"
            :type="singleResult.status === 'normal' ? 'success' : singleResult.status === 'borderline' ? 'warning' : 'danger'"
            size="small"
          >
            {{ singleResult.statusLabel }}
          </el-tag>
          <span v-else class="status-na">—</span>
        </div>
      </div>

      <div class="summary-actions">
        <el-button @click="handleReset">
          <el-icon><Refresh /></el-icon>
          Reset
        </el-button>
        <el-button @click="handleReSelect">
          <el-icon><RefreshLeft /></el-icon>
          Re-select Metric
        </el-button>
        <el-button @click="handleCopySummary">
          <el-icon><CopyDocument /></el-icon>
          Copy Summary
        </el-button>
        <el-button type="primary" @click="handleExport">
          <el-icon><Download /></el-icon>
          Export Report
        </el-button>
      </div>
    </el-card>

    <!-- Region 2: Parameter Extraction -->
    <el-card v-if="!computing" class="region-card">
      <template #header>
        <div class="region-header">
          <el-icon :size="22"><Document /></el-icon>
          <span>Parameter Extraction</span>
          <el-button text size="small" style="margin-left: auto" @click="extractionExpanded = !extractionExpanded">
            {{ extractionExpanded ? 'Collapse' : 'Expand' }}
          </el-button>
        </div>
      </template>
      <ExtractionHighlight
        v-model="extractionExpanded"
        :raw-text="computeStore.rawText"
        :params="singleResult?.extractedParams ?? []"
      />
    </el-card>

    <!-- Region 3: Metric Result -->
    <el-card v-if="singleResult" class="region-card">
      <template #header>
        <div class="region-header">
          <el-icon :size="22"><DataAnalysis /></el-icon>
          <span>Metric Result</span>
          <el-button text size="small" style="margin-left: auto" @click="metricsExpanded = !metricsExpanded">
            {{ metricsExpanded ? 'Collapse' : 'Expand' }}
          </el-button>
        </div>
      </template>

      <template v-if="metricsExpanded">
        <MetricResultCard
          :result="singleResult"
          @tool-click="handleToolClick"
        />

        <el-empty
          v-if="!singleResult"
          description="No results to display"
        />
      </template>
    </el-card>

    <!-- Tool Detail Drawer -->
    <el-drawer
      v-model="toolDrawerVisible"
      :title="selectedTool?.MetaInfo.Name || 'Tool Detail'"
      size="500px"
    >
      <template v-if="selectedTool">
        <div class="drawer-section">
          <h4>Description</h4>
          <p>{{ selectedTool.MetaInfo.Description }}</p>
        </div>
        <div class="drawer-section">
          <h4>Scope</h4>
          <p>{{ selectedTool.MetaInfo.Scope }}</p>
        </div>
        <div class="drawer-section">
          <h4>Execution Logic</h4>
          <ol>
            <li v-for="(step, i) in selectedTool.ExecInfo.Logic" :key="i">
              {{ step }}
            </li>
          </ol>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<style scoped>
.compute-result-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 0 40px;
  min-height: calc(100vh - 56px);
}


.region-card {
  margin-top: 20px;
}

.region-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 700;
  color: var(--claude-orange);
}

/* Single summary */
.single-summary {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 16px;
}

.summary-label {
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 700;
  color: var(--claude-text-dark);
  min-width: 70px;
}

.summary-value {
  font-size: 14px;
  color: var(--claude-text-dark);
  font-weight: 500;
}

.result-value-lg {
  font-weight: 700;
  font-size: 24px;
}

.result-value-lg.status-normal {
  color: #52C41A;
}

.result-value-lg.status-borderline {
  color: #FAAD14;
}

.result-value-lg.status-abnormal {
  color: #FF4D4F;
}

.result-unit {
  font-size: 14px;
  color: var(--claude-text-light);
  margin-left: 4px;
}

/* Result cell */
.result-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #C0C4CC;
  flex-shrink: 0;
}

.status-dot.dot-normal { background: #52C41A; }
.status-dot.dot-borderline { background: #FAAD14; }
.status-dot.dot-abnormal { background: #FF4D4F; }

.summary-actions {
  display: flex;
  gap: 12px;
  margin-top: 16px;
  justify-content: center;
}

.status-na {
  color: #C0C4CC;
  font-size: 13px;
}

.drawer-section {
  margin-bottom: 20px;
}

.drawer-section h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: var(--claude-text-dark);
}

.drawer-section p,
.drawer-section ol {
  margin: 0;
  font-size: 13px;
  color: var(--claude-text-mid);
  line-height: 1.6;
}

.drawer-section ol {
  padding-left: 20px;
}

/* Loading */
.loading-card {
  margin-top: 24px;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 0;
}

.spinner-ring {
  position: relative;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
}

.ring-ring {
  position: absolute;
  width: 80px;
  height: 80px;
  border: 4px solid var(--claude-border);
  border-top-color: #D97757;
  border-radius: 50%;
  animation: ring-spin 1s linear infinite;
}

@keyframes ring-spin {
  to { transform: rotate(360deg); }
}

.ring-icon {
  color: #D97757;
}

.loading-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--claude-text-dark);
  margin: 0 0 8px 0;
}

.loading-subtitle {
  font-size: 14px;
  color: var(--claude-text-light);
  margin: 0 0 32px 0;
}

.loading-steps {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.loading-step {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  position: relative;
}

.step-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 28px;
  flex-shrink: 0;
  margin-top: 2px;
}

.step-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #D97757;
  animation: dot-pulse 1.5s ease-in-out infinite;
  flex-shrink: 0;
}

.loading-step:nth-child(2) .step-dot { animation-delay: 0.3s; }
.loading-step:nth-child(3) .step-dot { animation-delay: 0.6s; }
.loading-step:nth-child(4) .step-dot { animation-delay: 0.9s; }

@keyframes dot-pulse {
  0%, 100% { transform: scale(1); opacity: 0.4; }
  50% { transform: scale(1.5); opacity: 1; }
}

.step-line {
  width: 2px;
  height: 28px;
  background: var(--claude-border);
}

.step-label {
  font-size: 14px;
  color: var(--claude-text-mid);
  padding: 0 0 16px 0;
  line-height: 1.4;
}

.dismiss-btn {
  margin-top: 24px;
}

/* Error */
.error-card {
  margin-top: 24px;
}

.error-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 0;
  gap: 16px;
}

.error-message {
  font-size: 15px;
  color: var(--claude-text-mid);
  margin: 0;
}
</style>
