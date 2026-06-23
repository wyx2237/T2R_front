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
import CodeBlock from '@/components/shared/CodeBlock.vue'
import { ElMessage } from 'element-plus'
import { InfoFilled, SetUp, Collection } from '@element-plus/icons-vue'

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
const computeError = ref('')

const singleResult = computed(() => computeStore.results[0] ?? null)

function formatNumber(val: number): number | string {
  if (typeof val !== 'number') return val
  if (Number.isInteger(val)) return val
  const str = val.toString()
  const decimalIndex = str.indexOf('.')
  if (decimalIndex === -1) return val
  if (str.length - decimalIndex - 1 > 4) {
    return Number(val.toFixed(4))
  }
  return val
}

const isResultError = computed(() => singleResult.value?.status === 'error')

const computingSteps = [
  { label: 'Extracting parameters from case text', icon: 'Search' },
  { label: 'Matching parameters to indicator inputs', icon: 'Connection' },
  { label: 'Running computation workflow', icon: 'Loading' },
  { label: 'Evaluating results', icon: 'Finished' },
]

function handleToolClick(category: string) {
  const tool = tools.value.find((t) => t.MetaInfo.Name === category)
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
  if (isResultError.value) {
    copy(`${r.metricName} (${r.metricCode}): ${r.statusLabel || 'Error'}`)
  } else {
    const text = `${r.metricName} (${r.metricCode}): ${r.finalValue} ${r.finalUnit}` +
      (r.statusLabel ? ` — ${r.statusLabel}` : '')
    copy(text)
  }
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
    computing.value = false
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
          <span class="summary-label">Indicator</span>
          <span class="summary-value">
            <code class="code-badge">&lt;{{ singleResult.metricCode }}&gt;</code>
            {{ singleResult.metricName }}
          </span>
        </div>

        <template v-if="isResultError">
          <div class="summary-item">
            <span class="summary-label">Status</span>
            <el-tag
              v-if="singleResult.statusLabel"
              class="status-tag"
              :class="`status-tag--${singleResult.status || 'default'}`"
              size="small"
            >
              <span class="status-tag-dot" />
              {{ singleResult.statusLabel }}
            </el-tag>
          </div>
        </template>

        <template v-else>
          <div class="summary-item">
            <span class="summary-label">Result</span>
            <span class="result-cell">
              <span class="status-dot" :class="singleResult.status ? `dot-${singleResult.status}` : ''" />
              <span
                class="result-value-lg"
                :class="singleResult.status ? `status-${singleResult.status}` : ''"
              >
                {{ formatNumber(singleResult.finalValue) }}
              </span>
              <span class="result-unit">{{ singleResult.finalUnit }}</span>
            </span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Status</span>
            <el-tag
              v-if="singleResult.status && singleResult.statusLabel"
              class="status-tag"
              :class="`status-tag--${singleResult.status || 'default'}`"
              size="small"
            >
              <span class="status-tag-dot" />
              {{ singleResult.statusLabel }}
            </el-tag>
            <span v-else class="status-na">—</span>
          </div>
        </template>
      </div>

      <div class="summary-actions">
        <el-button @click="handleReset">
          <el-icon><Refresh /></el-icon>
          Reset
        </el-button>
        <el-button @click="handleReSelect">
          <el-icon><RefreshLeft /></el-icon>
          Re-select Indicator
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
          <span>Indicator Result</span>
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
      size="520px"
      class="tool-detail-drawer"
    >
      <template v-if="selectedTool">
        <div class="tool-drawer-body">
          <!-- Header: Name + Description -->
          <div class="drawer-header">
            <h3 class="drawer-tool-name">{{ selectedTool.MetaInfo.Name }}</h3>
            <p class="drawer-tool-desc">{{ selectedTool.MetaInfo.Description }}</p>
          </div>

          <!-- Scope -->
          <div class="drawer-meta-row">
            <span class="drawer-meta-tag">Scope</span>
            <span class="drawer-meta-text">{{ selectedTool.MetaInfo.Scope }}</span>
          </div>

          <!-- Language + Libraries -->
          <div class="drawer-meta-row drawer-meta-row-split">
            <div class="drawer-meta-half">
              <span class="drawer-meta-tag">Language</span>
              <el-tag size="small" type="info" effect="plain">{{ selectedTool.ExecInfo.Language }}</el-tag>
            </div>
            <div class="drawer-meta-half">
              <span class="drawer-meta-tag">Libraries</span>
              <template v-if="selectedTool.ExecInfo.Library.length > 0">
                <el-tag
                  v-for="lib in selectedTool.ExecInfo.Library"
                  :key="lib"
                  size="small"
                  type="info"
                  effect="plain"
                  style="margin-right: 4px"
                >
                  {{ lib }}
                </el-tag>
              </template>
              <span v-else class="drawer-no-libs">—</span>
            </div>
          </div>

          <!-- FlowInfo -->
          <el-divider />
          <div class="drawer-section">
            <div class="drawer-section-badge badge-flow">
              <el-icon><InfoFilled /></el-icon>
              <span>FlowInfo</span>
            </div>
            <div class="drawer-flow-grid">
              <div class="drawer-flow-item">
                <h5>Input</h5>
                <p>{{ selectedTool.FlowInfo.Input.Description }}</p>
                <CodeBlock :code="selectedTool.FlowInfo.Input.Example" lang="json" />
              </div>
              <div class="drawer-flow-item">
                <h5>Output</h5>
                <p>{{ selectedTool.FlowInfo.Output.Description }}</p>
                <CodeBlock :code="selectedTool.FlowInfo.Output.Example" lang="json" />
              </div>
            </div>
          </div>

          <!-- Execution Logic -->
          <el-divider />
          <div class="drawer-section">
            <div class="drawer-section-badge badge-exec">
              <el-icon><SetUp /></el-icon>
              <span>Execution Logic</span>
            </div>
            <ol class="drawer-logic-steps">
              <li v-for="(step, i) in selectedTool.ExecInfo.Logic" :key="i">
                {{ step }}
              </li>
            </ol>
          </div>

          <!-- Examples -->
          <el-divider />
          <div class="drawer-section">
            <div class="drawer-section-badge badge-examples">
              <el-icon><Collection /></el-icon>
              <span>Examples ({{ selectedTool.Examples.length }})</span>
            </div>
            <div
              v-for="(ex, i) in selectedTool.Examples"
              :key="i"
              class="drawer-example-item"
            >
              <h5 class="drawer-example-name">{{ ex.ToolName }}</h5>
              <div class="drawer-example-inline">
                <span class="drawer-example-label">Parameters</span>
                <code class="drawer-inline-params">{{ JSON.stringify(ex.Parameters) }}</code>
              </div>
              <div class="drawer-example-inline">
                <span class="drawer-example-label">Output</span>
                <code class="drawer-inline-params">{{ JSON.stringify(ex.Output) }}</code>
              </div>
              <div class="drawer-example-block">
                <span class="drawer-example-label">Code</span>
                <CodeBlock :code="ex.Code" lang="python" />
              </div>
              <el-divider v-if="i < selectedTool.Examples.length - 1" />
            </div>
          </div>
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

.code-badge {
  font-weight: 700;
  color: #D97757;
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 14px;
  margin-right: 8px;
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

.result-value-lg.status-error {
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
.status-dot.dot-error { background: #FF4D4F; }

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

/* ── Status Tags (Claude style) ── */
.status-tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  border: none !important;
  font-weight: 600;
  padding: 4px 12px !important;
  border-radius: 4px;
}

.status-tag-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-tag--normal {
  background: #E8F8E0 !important;
  color: #389E0D !important;
}
.status-tag--normal .status-tag-dot {
  background: #52C41A;
}

.status-tag--borderline {
  background: #FFF7E6 !important;
  color: #D48806 !important;
}
.status-tag--borderline .status-tag-dot {
  background: #FAAD14;
}

.status-tag--abnormal {
  background: #FFF0F0 !important;
  color: #CF1322 !important;
}
.status-tag--abnormal .status-tag-dot {
  background: #FF4D4F;
}

.status-tag--error {
  background: #FFF0F0 !important;
  color: #CF1322 !important;
}
.status-tag--error .status-tag-dot {
  background: #FF4D4F;
}

/* ── Tool Detail Drawer (matches ToolLibrary.vue card style) ── */
.tool-detail-drawer :deep(.el-drawer__body) {
  padding: 20px 24px;
}

.tool-drawer-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.drawer-header {
  margin-bottom: 14px;
}

.drawer-tool-name {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 700;
  color: var(--claude-text-dark);
  margin: 0 0 10px 0;
}

.drawer-tool-desc {
  font-size: 14px;
  color: var(--claude-text-mid);
  line-height: 1.7;
  margin: 0;
}

.drawer-meta-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 6px 0;
}

.drawer-meta-row-split {
  gap: 32px;
}

.drawer-meta-half {
  display: flex;
  align-items: center;
  gap: 8px;
}

.drawer-meta-tag {
  display: inline-block;
  font-size: 11px;
  font-weight: 600;
  color: var(--claude-text-light);
  text-transform: uppercase;
  letter-spacing: 0.4px;
  background: var(--claude-warm-bg);
  padding: 2px 8px;
  border-radius: 4px;
  flex-shrink: 0;
}

.drawer-meta-text {
  font-size: 13px;
  color: var(--claude-text-mid);
  line-height: 1.6;
}

.drawer-no-libs {
  color: var(--claude-text-light);
  font-size: 13px;
}

.drawer-section {
  margin-bottom: 4px;
}

.drawer-section-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  padding: 5px 14px;
  border-radius: 6px;
  margin: 0 0 14px 0;
}

.badge-flow {
  background: var(--el-color-primary-light-9);
  color: #D97757;
}

.badge-exec {
  background: #F0F9EB;
  color: #67C23A;
}

.badge-examples {
  background: #F4F0FE;
  color: #9065E6;
}

.drawer-section h5 {
  font-size: 14px;
  color: var(--claude-text-dark);
  margin: 0 0 8px 0;
  font-weight: 600;
}

.drawer-flow-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.drawer-flow-item p {
  font-size: 13px;
  color: #6B7280;
  line-height: 1.6;
  margin: 0 0 10px 0;
}

.drawer-logic-steps {
  margin: 0;
  padding-left: 22px;
  font-size: 13px;
  color: var(--claude-text-mid);
  line-height: 2;
}

.drawer-logic-steps li {
  padding-left: 2px;
}

.drawer-example-item {
  margin-bottom: 8px;
}

.drawer-example-name {
  font-size: 14px;
  color: var(--claude-text-dark);
  margin: 0 0 14px 0;
  font-weight: 600;
}

.drawer-example-inline {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}

.drawer-inline-params {
  font-size: 13px;
  color: var(--claude-text-mid);
  background: #F8F9FA;
  padding: 3px 10px;
  border-radius: 4px;
  font-family: 'SF Mono', 'Fira Code', monospace;
}

.drawer-example-block {
  margin-bottom: 14px;
}

.drawer-example-label {
  font-size: 12px;
  font-weight: 600;
  color: #969BA3;
  text-transform: uppercase;
  letter-spacing: 0.5px;
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
