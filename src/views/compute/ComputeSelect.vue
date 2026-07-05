<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useComputeStore } from '@/stores/compute'
import { getMetrics } from '@/api/metrics'
import type { Metric } from '@/types/metric'
import MetricCard from '@/components/compute/MetricCard.vue'
import ComputeSteps from '@/components/compute/ComputeSteps.vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const computeStore = useComputeStore()

const stepIndex = ref(1)

const allMetrics = ref<Metric[]>([])

const recommendedMetrics = computed(() => {
  const list = [...computeStore.availableMetrics]
  // Sort by department then name
  list.sort((a, b) => {
    const dept = a.department.localeCompare(b.department)
    if (dept !== 0) return dept
    return a.name.localeCompare(b.name)
  })
  // Limit to top 5
  return list.slice(0, 5)
})

const selectedMetric = computed(() => {
  if (!computeStore.selectedMetricId) return null
  return allMetrics.value.find((m) => m.id === computeStore.selectedMetricId) || null
})

function selectMetric(metricId: string) {
  if (computeStore.selectedMetricId === metricId) {
    computeStore.selectedMetricId = null
  } else {
    computeStore.selectedMetricId = metricId
  }
}

function selectMetricFromTree(metricId: string) {
  computeStore.selectedMetricId = metricId
}

async function handleCompute() {
  if (!computeStore.selectedMetricId) {
    ElMessage.warning('Please select an indicator')
    return
  }
  router.push(`/compute/${computeStore.sessionId}/execute`)
}

function handlePrevious() {
  router.push('/compute/upload')
}

function goBackToUpload() {
  computeStore.resetToUpload()
  router.push('/compute/upload')
}

onMounted(async () => {
  const res = await getMetrics({ pageSize: 1000 })
  allMetrics.value = res.items

  if (computeStore.availableMetrics.length === 0) {
    computeStore.availableMetrics = res.items
  }
})

// Check session validity
if (!computeStore.sessionId) {
  router.replace('/compute/upload')
}
</script>

<template>
  <div class="compute-select-page">
    <ComputeSteps :active="stepIndex" />

    <!-- Case Summary -->
    <el-card class="section-card">
      <template #header>
        <div class="region-header">
          <el-icon :size="22"><Document /></el-icon>
          <span>Case Summary</span>
        </div>
      </template>
      <p class="case-text">{{ computeStore.rawText }}</p>
    </el-card>

    <!-- Recommended Metrics -->
    <el-card class="section-card">
      <template #header>
        <div class="region-header">
          <el-icon :size="22"><DataAnalysis /></el-icon>
          <span>Recommended Indicators</span>
        </div>
      </template>

      <el-row :gutter="16">
        <el-col
          v-for="metric in recommendedMetrics"
          :key="metric.id"
          :span="8"
          style="margin-bottom: 16px"
        >
          <MetricCard
            :metric="metric"
            :selected="computeStore.selectedMetricId === metric.id"
            :all-params="metric.inputs.map((i) => i.input_name)"
            @select="selectMetric"
          />
        </el-col>
      </el-row>

      <el-empty
        v-if="recommendedMetrics.length === 0"
        description="No matching indicators found"
      />
    </el-card>

    <!-- Browse All Metrics -->
    <el-card class="section-card">
      <template #header>
        <div class="browse-header">
          <div class="region-header">
            <el-icon :size="22"><FolderOpened /></el-icon>
            <span>Browse All Indicators</span>
          </div>
          <span class="browse-hint">Select any indicator from the library. Computation may fail if required parameters are missing from the case.</span>
        </div>
      </template>
      <el-tree
        :data="[...new Set(allMetrics.map((m) => m.department))].map((dept) => ({
          label: dept,
          children: allMetrics
            .filter((m) => m.department === dept)
            .map((m) => ({
              label: `${m.name} (${m.code})`,
              id: m.id,
            }))
        }))"
        node-key="id"
        highlight-current
        :default-expanded-keys="[]"
        @node-click="(node: any) => selectMetricFromTree(node.id)"
      />
    </el-card>

    <!-- Selected Metric Detail -->
    <el-card class="section-card" v-if="selectedMetric">
      <template #header>
        <div class="region-header">
          <el-icon :size="22"><Select /></el-icon>
          <span>Selected Indicator</span>
        </div>
      </template>
      <el-descriptions :column="2" border size="small">
        <el-descriptions-item label="Name">{{ selectedMetric.name }}</el-descriptions-item>
        <el-descriptions-item label="Code">{{ selectedMetric.code }}</el-descriptions-item>
        <el-descriptions-item label="Department">{{ selectedMetric.department }}</el-descriptions-item>
        <el-descriptions-item label="Reference">{{ selectedMetric.reference }}</el-descriptions-item>
        <el-descriptions-item label="Description" :span="2">
          {{ selectedMetric.description }}
        </el-descriptions-item>
      </el-descriptions>
      <div class="selected-inputs">
        <span class="inputs-label">Inputs:</span>
        <div class="inputs-tags">
          <span
            v-for="input in selectedMetric.inputs"
            :key="input.input_name"
            class="input-tag"
          >{{ input.input_name }}</span>
        </div>
      </div>
    </el-card>

    <div class="section-card" v-else>
      <div class="no-selection">No indicator selected</div>
    </div>

    <!-- Action Buttons -->
    <div class="action-bar">
      <el-button @click="handlePrevious">Previous</el-button>
      <el-button
        type="primary"
        :disabled="!computeStore.selectedMetricId"
        @click="handleCompute"
      >
        Calculate &rarr;
      </el-button>
    </div>
  </div>
</template>

<style scoped>
.compute-select-page {
  max-width: 1200px;
  margin: 0 auto;
}

.section-card {
  margin-top: 16px;
}

.section-title {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 700;
  color: var(--claude-orange);
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

.case-text {
  font-size: 13px;
  color: var(--claude-text-dark);
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.6;
  margin: 0;
}

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  padding: 16px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.no-selection {
  padding: 16px;
  text-align: center;
  font-size: 14px;
  color: var(--claude-text-light);
}

.selected-inputs {
  margin-top: 16px;
}

.inputs-label {
  font-size: 14px;
  color: var(--claude-text-dark);
  font-weight: 600;
}

.inputs-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}

.input-tag {
  display: inline-flex;
  align-items: center;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
  background: var(--claude-warm-bg);
  color: var(--claude-text-light);
}

.browse-header {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.browse-hint {
  font-size: 12px;
  color: var(--claude-text-light);
  font-weight: 400;
}
</style>
