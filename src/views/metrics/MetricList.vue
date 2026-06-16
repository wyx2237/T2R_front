<script setup lang="ts">
import { ref, onMounted, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getMetrics, deleteMetric, type MetricListParams } from '@/api/metrics'
import type { Metric } from '@/types/metric'
import SearchBar from '@/components/shared/SearchBar.vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()

const metrics = ref<Metric[]>([])
const loading = ref(false)
const total = ref(0)

const filters = reactive<MetricListParams>({
  keyword: '',
  department: '',
  page: 1,
  pageSize: 20,
})

const departments = ref<string[]>([])

async function fetchMetrics() {
  loading.value = true
  try {
    const res = await getMetrics(filters)
    metrics.value = res.items
    total.value = res.total
    // Collect unique departments from all items
    if (departments.value.length === 0) {
      const deptSet = new Set(res.items.map((m) => m.department))
      // Fetch all to get departments (simplified — in production the backend would return a department list)
    }
  } catch {
    ElMessage.error('Failed to load metrics')
  } finally {
    loading.value = false
  }
}

async function handleDelete(metric: Metric) {
  try {
    await ElMessageBox.confirm(
      `Are you sure you want to delete "${metric.name}"?`,
      'Confirm Delete',
      { type: 'warning' }
    )
    await deleteMetric(metric.id)
    ElMessage.success('Metric deleted')
    fetchMetrics()
  } catch {
    // cancelled
  }
}

function viewDetail(id: string) {
  router.push(`/metrics/${id}`)
}

function handleSearch(val: string) {
  filters.keyword = val
  filters.page = 1
  fetchMetrics()
}

watch(
  () => filters.department,
  () => {
    filters.page = 1
    fetchMetrics()
  }
)

watch(
  () => filters.page,
  () => fetchMetrics()
)

onMounted(() => {
  fetchMetrics()
  // Get department list
  getMetrics({ pageSize: 1000 }).then((res) => {
    departments.value = [...new Set(res.items.map((m) => m.department))]
  })
})
</script>

<template>
  <div class="metric-list-page">
    <div class="page-header">
      <h2>Metrics Management</h2>
      <el-button type="primary" @click="router.push('/metrics/create')">
        + New Metric
      </el-button>
    </div>

    <el-card class="filter-card">
      <div class="filter-bar">
        <div class="filter-search">
          <SearchBar
            :model-value="filters.keyword || ''"
            placeholder="Search name/code..."
            @update:model-value="handleSearch"
          />
        </div>
        <el-select
          v-model="filters.department"
          placeholder="Department"
          clearable
          style="width: 180px"
        >
          <el-option
            v-for="dept in departments"
            :key="dept"
            :label="dept"
            :value="dept"
          />
        </el-select>
      </div>
    </el-card>

    <el-card class="table-card">
      <el-table
        v-loading="loading"
        :data="metrics"
        stripe
        style="width: 100%"
        @row-click="(row: Metric) => viewDetail(row.id)"
      >
        <el-table-column prop="name" label="Name" min-width="200">
          <template #default="{ row }">
            <span class="metric-name">{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="code" label="Code" width="120" />
        <el-table-column prop="department" label="Department" width="140" />
        <el-table-column label="Steps" width="80" align="center">
          <template #default="{ row }">
            {{ row.steps.length }}
          </template>
        </el-table-column>
        <el-table-column label="Actions" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <el-button
              text
              type="primary"
              size="small"
              @click.stop="viewDetail(row.id)"
            >
              View
            </el-button>
            <el-button
              text
              type="primary"
              size="small"
              @click.stop="router.push(`/metrics/${row.id}/edit`)"
            >
              Edit
            </el-button>
            <el-popconfirm
              title="Are you sure to delete this metric?"
              @confirm="handleDelete(row)"
            >
              <template #reference>
                <el-button
                  text
                  type="danger"
                  size="small"
                  @click.stop
                >
                  Delete
                </el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-row">
        <el-pagination
          v-model:current-page="filters.page"
          v-model:page-size="filters.pageSize"
          :total="total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          background
        />
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.metric-list-page {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.page-header h2 {
  margin: 0;
  font-size: 20px;
  color: #303133;
}

.filter-card {
  margin-bottom: 16px;
}

.filter-bar {
  display: flex;
  gap: 12px;
  align-items: center;
}

.filter-search {
  flex: 1;
  max-width: 320px;
}

.table-card {
  margin-bottom: 16px;
}

.metric-name {
  color: #409EFF;
  cursor: pointer;
}

.pagination-row {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
