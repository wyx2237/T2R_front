<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getMetricById, deleteMetric } from '@/api/metrics'
import type { Metric, StepInput } from '@/types/metric'
import CodeBlock from '@/components/shared/CodeBlock.vue'
import PipelineViewer from '@/components/metrics/PipelineViewer.vue'
import { useClipboard } from '@/composables/useClipboard'
import { ElMessage, ElMessageBox } from 'element-plus'

const route = useRoute()
const router = useRouter()
const { copy } = useClipboard()

const metric = ref<Metric | null>(null)
const loading = ref(false)
const expandedSteps = ref<Set<string>>(new Set())

const stepsDefaultExpanded = computed(() => {
  return metric.value && metric.value.steps.length === 1
})

function initExpanded() {
  if (stepsDefaultExpanded.value && metric.value) {
    expandedSteps.value = new Set(metric.value.steps.map((s) => s.step_id))
  }
}

function toggleStep(stepId: string) {
  const next = new Set(expandedSteps.value)
  if (next.has(stepId)) {
    next.delete(stepId)
  } else {
    next.add(stepId)
  }
  expandedSteps.value = next
}

function sourceLabel(si: StepInput): string {
  const src = si.input_source
  if (src.startsWith('$|inputs|')) return 'Raw Text'
  const stepMatch = src.match(/\$|steps|\.(\d+)\./)
  if (stepMatch && metric.value) {
    const stepNum = stepMatch[1]
    const step = metric.value.steps.find((s) => s.step_id === stepNum)
    if (step) return `Step ${stepNum} — ${step.step_name}`
    return `Step ${stepNum}`
  }
  return src
}

async function fetchData() {
  loading.value = true
  try {
    const id = route.params.id as string
    metric.value = await getMetricById(id)
    initExpanded()
  } catch {
    ElMessage.error('Failed to load metric')
  } finally {
    loading.value = false
  }
}

async function handleDelete() {
  if (!metric.value) return
  try {
    await ElMessageBox.confirm(
      `Are you sure you want to delete "${metric.value.name}"?`,
      'Confirm Delete',
      { type: 'warning' }
    )
    await deleteMetric(metric.value.id)
    ElMessage.success('Metric deleted')
    router.push('/metrics')
  } catch {
    // cancelled
  }
}

onMounted(fetchData)
</script>

<template>
  <div class="metric-detail-page" v-loading="loading">
    <div class="page-header">
      <div class="header-left">
        <el-button text @click="router.push('/metrics')">
          <el-icon><ArrowLeft /></el-icon>
          Back to List
        </el-button>
        <h2 v-if="metric">{{ metric.name }}</h2>
      </div>
      <div class="header-actions" v-if="metric">
        <el-button type="primary" @click="router.push(`/metrics/${metric.id}/edit`)">
          Edit
        </el-button>
        <el-button type="danger" @click="handleDelete">Delete</el-button>
      </div>
    </div>

    <template v-if="metric">
      <!-- Basic Info -->
      <el-card class="section-card">
        <template #header><span class="section-title">Basic Information</span></template>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="Code">{{ metric.code }}</el-descriptions-item>
          <el-descriptions-item label="Department">{{ metric.department }}</el-descriptions-item>
          <el-descriptions-item label="Reference" :span="2">{{ metric.reference }}</el-descriptions-item>
          <el-descriptions-item label="Description" :span="2">
            {{ metric.description }}
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- Workflow Inputs -->
      <el-card class="section-card">
        <template #header><span class="section-title">Workflow Inputs</span></template>
        <el-table :data="metric.inputs" stripe>
          <el-table-column prop="input_name" label="Name" min-width="160" />
          <el-table-column prop="input_type" label="Type" width="100" />
          <el-table-column prop="input_desc" label="Description" min-width="220" />
        </el-table>
      </el-card>

      <!-- Workflow Output -->
      <el-card class="section-card">
        <template #header><span class="section-title">Workflow Output</span></template>
        <div class="output-display">
          <span class="output-name">{{ metric.output.output_name }}</span>
          <el-tag size="small" type="info" effect="plain">{{ metric.output.output_type }}</el-tag>
          <span class="output-desc">{{ metric.output.output_desc }}</span>
        </div>
      </el-card>

      <!-- Step Sequence -->
      <el-card class="section-card">
        <template #header><span class="section-title">Step Sequence</span></template>

        <!-- Pipeline overview -->
        <PipelineViewer :steps="metric.steps" />

        <!-- Step detail cards -->
        <div class="step-cards">
          <div
            v-for="step in metric.steps"
            :key="step.step_id"
            class="step-card"
            :class="{ expanded: expandedSteps.has(step.step_id) }"
            @click="toggleStep(step.step_id)"
          >
            <div class="step-card-header">
              <div class="step-header-left">
                <span class="step-badge">{{ step.step_id }}</span>
                <span class="step-title">{{ step.step_name }}</span>
                <span class="step-category">{{ step.category }}</span>
              </div>
              <span class="step-toggle">
                {{ expandedSteps.has(step.step_id) ? '▲' : '▼' }}
              </span>
            </div>

            <p class="step-desc-text">{{ step.step_description }}</p>

            <!-- Expanded detail -->
            <div v-if="expandedSteps.has(step.step_id)" class="step-detail" @click.stop>
              <div class="step-reason">
                <strong>Why:</strong> {{ step.reason }}
              </div>
              <div class="step-detail-text">
                <strong>Detail:</strong> {{ step.detail }}
              </div>

              <!-- Step Inputs -->
              <div class="step-io">
                <h5>Inputs</h5>
                <table class="io-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Type</th>
                      <th>Source</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="si in step.step_inputs" :key="si.input_name">
                      <td class="io-name">{{ si.input_name }}</td>
                      <td><el-tag size="small" type="info" effect="plain">{{ si.input_type }}</el-tag></td>
                      <td><span class="io-source">{{ sourceLabel(si) }}</span></td>
                      <td class="io-desc">{{ si.input_desc }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Step Outputs -->
              <div class="step-io">
                <h5>Outputs</h5>
                <table class="io-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Type</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="so in step.step_outputs" :key="so.output_name">
                      <td class="io-name">{{ so.output_name }}</td>
                      <td><el-tag size="small" type="info" effect="plain">{{ so.output_type }}</el-tag></td>
                      <td class="io-desc">{{ so.output_desc }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </el-card>

      <!-- Executable Code -->
      <el-card class="section-card">
        <template #header>
          <div class="card-header-row">
            <span class="section-title">Executable Code</span>
            <el-button size="small" @click="copy(metric.executableCode)">Copy Code</el-button>
          </div>
        </template>
        <CodeBlock :code="metric.executableCode" lang="python" />
      </el-card>
    </template>
  </div>
</template>

<style scoped>
.metric-detail-page {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-left h2 {
  margin: 0;
  font-size: 20px;
}

.section-card {
  margin-bottom: 16px;
}

.section-title {
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 600;
}

.card-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.output-display {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
}

.output-name {
  font-weight: 700;
  color: var(--claude-text-dark);
  font-family: 'SF Mono', 'Fira Code', monospace;
}

.output-desc {
  color: var(--claude-text-light);
  font-size: 13px;
}

/* Step cards */
.step-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 24px;
}

.step-card {
  border: 1px solid var(--claude-border);
  border-radius: 8px;
  padding: 16px 20px;
  cursor: pointer;
  transition: box-shadow 0.2s, border-color 0.2s;
}

.step-card:hover {
  border-color: #C0C4CC;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.step-card.expanded {
  border-color: #D97757;
  cursor: default;
}

.step-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.step-header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.step-badge {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #D97757;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
  flex-shrink: 0;
}

.step-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--claude-text-dark);
}

.step-category {
  font-size: 12px;
  color: var(--claude-text-light);
  background: var(--claude-warm-bg);
  padding: 2px 10px;
  border-radius: 4px;
}

.step-toggle {
  font-size: 12px;
  color: var(--claude-text-light);
  flex-shrink: 0;
}

.step-desc-text {
  font-size: 14px;
  color: var(--claude-text-mid);
  margin: 10px 0 0 0;
  line-height: 1.6;
}

/* Expanded detail */
.step-detail {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.step-reason,
.step-detail-text {
  font-size: 13px;
  color: var(--claude-text-mid);
  line-height: 1.6;
  padding: 10px 14px;
  background: var(--claude-warm-bg);
  border-radius: 6px;
}

.step-reason strong,
.step-detail-text strong {
  color: var(--claude-text-dark);
}

.step-io {
  margin-top: 4px;
}

.step-io h5 {
  font-size: 13px;
  color: var(--claude-text-dark);
  margin: 0 0 8px 0;
  font-weight: 600;
}

.io-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.io-table th {
  text-align: left;
  padding: 8px 12px;
  background: var(--claude-warm-bg);
  color: var(--claude-text-light);
  font-weight: 500;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.io-table td {
  padding: 10px 12px;
  border-bottom: 1px solid var(--claude-border);
  color: var(--claude-text-mid);
}

.io-name {
  font-weight: 600;
  color: var(--claude-text-dark);
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 13px;
}

.io-source {
  font-size: 12px;
  color: #D97757;
  background: var(--el-color-primary-light-9);
  padding: 2px 8px;
  border-radius: 4px;
}

.io-desc {
  color: var(--claude-text-light);
}
</style>
