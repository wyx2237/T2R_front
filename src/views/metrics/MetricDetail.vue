<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getMetricById, deleteMetric } from '@/api/metrics'
import { getTools } from '@/api/tools'
import type { Metric, StepInput } from '@/types/metric'
import type { AtomicTool } from '@/types/tool'
import CodeBlock from '@/components/shared/CodeBlock.vue'
import { useClipboard } from '@/composables/useClipboard'
import { ElMessage, ElMessageBox } from 'element-plus'
import { InfoFilled, SetUp, Collection } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const { copy } = useClipboard()

const metric = ref<Metric | null>(null)
const loading = ref(false)
const expandedSteps = ref<Set<string>>(new Set())
const tools = ref<AtomicTool[]>([])
const toolDrawerVisible = ref(false)
const selectedTool = ref<AtomicTool | null>(null)

function categoryToToolName(category: string): string {
  return category.split('_').map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join('')
}

function formatCategory(category: string): string {
  return category.split('_').map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')
}

function openToolDrawer(category: string) {
  const toolName = categoryToToolName(category)
  const tool = tools.value.find((t) => t.MetaInfo.Name === toolName)
  if (tool) {
    selectedTool.value = tool
    toolDrawerVisible.value = true
  } else {
    ElMessage.warning(`No tool template found for: ${formatCategory(category)}`)
  }
}

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

  // Match $|<number>| (e.g. "$|2|.a" → step 2)
  const pipeMatch = src.match(/\$\|(\d+)\|/)
  if (pipeMatch && metric.value) {
    const stepNum = pipeMatch[1]
    const step = metric.value.steps.find((s) => s.step_id === stepNum)
    if (step) return `Step ${stepNum} — ${step.step_name}`
    return `Step ${stepNum}`
  }

  // Fallback: match $|steps|.<number>. format
  const stepMatch = src.match(/\$\(?:steps\)?|\.(\d+)\./)
  if (stepMatch && stepMatch[1] && metric.value) {
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
    ElMessage.error('Failed to load indicator')
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
    ElMessage.success('Indicator deleted')
    router.push('/metrics')
  } catch {
    // cancelled
  }
}

async function loadTools() {
  try {
    tools.value = await getTools()
  } catch {
    // tools are non-critical for this view
  }
}

onMounted(async () => {
  await Promise.all([fetchData(), loadTools()])
})
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

        <!-- Step detail cards with interleaved arrows -->
        <div class="step-cards">
          <template v-for="(step, idx) in metric.steps" :key="step.step_id">
            <div class="step-arrow" v-if="idx > 0">▼</div>
            <div
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
              <div class="step-category-row" @click="openToolDrawer(step.category)">
                <span class="category-label">Category:</span>
                <span class="category-value">{{ formatCategory(step.category) }}</span>
                <el-icon class="category-icon"><ArrowRight /></el-icon>
              </div>
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
          </template>
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

      <!-- Tool Template Drawer -->
      <el-drawer
        v-model="toolDrawerVisible"
        size="520px"
        class="tool-detail-drawer"
      >
        <template v-if="selectedTool">
          <div class="tool-drawer-body">
            <!-- Header -->
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
  gap: 0;
  margin-top: 24px;
}

.step-arrow {
  text-align: center;
  font-size: 16px;
  color: #D97757;
  font-weight: 800;
  padding: 8px 0;
  letter-spacing: 2px;
  user-select: none;
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

.step-category-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: var(--claude-warm-bg);
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}

.step-category-row:hover {
  background: #f0ebe5;
}

.category-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--claude-text-dark);
}

.category-value {
  font-size: 13px;
  color: #D97757;
  font-weight: 500;
}

.category-icon {
  margin-left: auto;
  font-size: 14px;
  color: var(--claude-text-light);
}

/* ── Tool Template Drawer (matches ToolLibrary.vue card style) ── */
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
</style>
