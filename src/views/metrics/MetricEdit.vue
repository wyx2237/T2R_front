<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getMetricById, updateMetric } from '@/api/metrics'
import type { Metric } from '@/types/metric'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

const route = useRoute()
const router = useRouter()
const metricId = route.params.id as string

const formRef = ref<FormInstance>()
const loading = ref(false)
const submitting = ref(false)

const form = reactive({
  name: '',
  code: '',
  department: '',
  reference: '',
  description: '',
})

const rules: FormRules = {
  name: [
    { required: true, message: 'Indicator name is required', trigger: 'blur' },
  ],
  code: [
    { required: true, message: 'Indicator code is required', trigger: 'blur' },
  ],
  department: [
    { required: true, message: 'Department is required', trigger: 'blur' },
  ],
}

const departmentOptions = [
  'General',
  'Cardiology',
  'Nephrology',
  'Neurology',
  'Pulmonology',
  'Endocrinology',
  'Gastroenterology',
  'Hematology',
  'Oncology',
  'Pediatrics',
]

async function fetchMetric() {
  loading.value = true
  try {
    const metric: Metric = await getMetricById(metricId)
    form.name = metric.name
    form.code = metric.code
    form.department = metric.department
    form.reference = metric.reference
    form.description = metric.description
  } catch {
    ElMessage.error('Failed to load indicator')
    router.push('/metrics')
  } finally {
    loading.value = false
  }
}

async function handleSubmit() {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
  } catch {
    return
  }

  submitting.value = true
  try {
    await updateMetric(metricId, {
      name: form.name,
      code: form.code,
      department: form.department,
      reference: form.reference,
      description: form.description,
    })
    ElMessage.success('Indicator updated successfully')
    router.push(`/metrics/${metricId}`)
  } catch {
    ElMessage.error('Failed to update indicator')
  } finally {
    submitting.value = false
  }
}

async function handleCancel() {
  router.push(`/metrics/${metricId}`)
}

onMounted(fetchMetric)
</script>

<template>
  <div class="metric-edit-page" v-loading="loading">
    <div class="page-header">
      <el-button text @click="router.push(`/metrics/${metricId}`)">
        <el-icon><ArrowLeft /></el-icon>
        Back to Detail
      </el-button>
    </div>

    <div class="page-content">
      <h2>Edit Indicator</h2>
      <p class="page-subtitle">
        Update the basic information for this indicator. Workflow steps and
        executable code are managed automatically.
      </p>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        @submit.prevent="handleSubmit"
      >
        <el-card class="form-section">
          <template #header>
            <span class="section-title">Basic Information</span>
          </template>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="Indicator Name" prop="name">
                <el-input v-model="form.name" placeholder="Indicator name" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Indicator Code" prop="code">
                <el-input v-model="form.code" placeholder="e.g., REN-001" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="Department" prop="department">
                <el-select
                  v-model="form.department"
                  placeholder="Select department"
                  style="width: 100%"
                  filterable
                  clearable
                >
                  <el-option
                    v-for="dept in departmentOptions"
                    :key="dept"
                    :label="dept"
                    :value="dept"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Reference">
                <el-input
                  v-model="form.reference"
                  placeholder="e.g., KDIGO 2024 Guidelines"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="Description">
            <el-input
              v-model="form.description"
              type="textarea"
              :rows="3"
              placeholder="Describe what this indicator calculates"
            />
          </el-form-item>
        </el-card>

        <div class="form-actions">
          <el-button @click="handleCancel">Cancel</el-button>
          <el-button
            type="primary"
            :loading="submitting"
            @click="handleSubmit"
          >
            {{ submitting ? 'Saving...' : 'Save Changes' }}
          </el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<style scoped>
.metric-edit-page {
  max-width: 900px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 16px;
}

.page-content h2 {
  margin: 0 0 8px 0;
  font-size: 22px;
  color: #303133;
}

.page-subtitle {
  margin: 0 0 24px 0;
  font-size: 14px;
  color: #909399;
  line-height: 1.6;
}

.form-section {
  margin-bottom: 16px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #EBEEF5;
}
</style>
