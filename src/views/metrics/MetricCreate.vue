<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { createMetric, type CreateMetricData } from '@/api/metrics'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

const router = useRouter()
const formRef = ref<FormInstance>()
const submitting = ref(false)
const showAdvanced = ref(false)

const form = reactive<CreateMetricData>({
  question: '',
  formula: '',
  name: '',
  code: '',
  department: '',
  reference: '',
  description: '',
})

const rules: FormRules = {
  question: [
    { required: true, message: 'Please describe what indicator you want to create', trigger: 'blur' },
    { min: 10, message: 'Description should be at least 10 characters', trigger: 'blur' },
  ],
  formula: [
    { required: true, message: 'Please enter the formula', trigger: 'blur' },
  ],
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

async function handleSubmit() {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
  } catch {
    return
  }

  submitting.value = true
  try {
    // Auto-fill name from question if advanced fields not expanded
    if (!showAdvanced.value) {
      form.name = ''
      form.code = ''
      form.department = ''
      form.reference = ''
      form.description = ''
    }

    const { metricId } = await createMetric({
      question: form.question,
      formula: form.formula || undefined,
      name: form.name || undefined,
      code: form.code || undefined,
      department: form.department || undefined,
      reference: form.reference || undefined,
      description: form.description || undefined,
    })
    ElMessage.success('Indicator created successfully')
    router.push(`/metrics/${metricId}`)
  } catch {
    ElMessage.error('Failed to create indicator')
  } finally {
    submitting.value = false
  }
}

function handleCancel() {
  router.push('/metrics')
}
</script>

<template>
  <div class="metric-create-page">
    <div class="page-content">
      <h2>Create New Indicator</h2>
      <p class="page-subtitle">
        Describe what you want to calculate in natural language. The system will
        generate a complete workflow with steps, inputs, and executable code.
      </p>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        @submit.prevent="handleSubmit"
      >
        <!-- Core fields -->
        <el-card class="form-section">
          <template #header>
            <span class="section-title">Indicator Definition</span>
          </template>

          <el-form-item label="Question / Description" prop="question">
            <el-input
              v-model="form.question"
              type="textarea"
              :rows="4"
              placeholder="Describe the indicator you want to create. Include relevant clinical context, inputs, and expected output.&#10;&#10;Example: Calculate eGFR using the CKD-EPI 2021 formula based on serum creatinine, age, and sex. Classify the result into CKD stages."
            />
          </el-form-item>

          <el-form-item label="Formula" prop="formula">
            <el-input
              v-model="form.formula"
              type="textarea"
              :rows="3"
              placeholder="e.g., eGFR = 142 × min(Scr/κ, 1)^α × max(Scr/κ, 1)^(-1.200) × 0.9938^Age × 1.012 [if female]"
            />
          </el-form-item>
        </el-card>

        <!-- Advanced fields toggle -->
        <div class="advanced-toggle">
          <el-button
            text
            type="primary"
            @click="showAdvanced = !showAdvanced"
          >
            <el-icon>
              <component :is="showAdvanced ? 'ArrowUp' : 'ArrowDown'" />
            </el-icon>
            {{ showAdvanced ? 'Hide' : 'Show' }} Advanced Fields
          </el-button>
        </div>

        <!-- Advanced fields -->
        <el-card v-if="showAdvanced" class="form-section">
          <template #header>
            <span class="section-title">Metadata (Advanced)</span>
          </template>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="Indicator Name" prop="name">
                <el-input
                  v-model="form.name"
                  placeholder="e.g., eGFR (CKD-EPI)"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Indicator Code" prop="code">
                <el-input
                  v-model="form.code"
                  placeholder="e.g., REN-001"
                />
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
              :rows="2"
              placeholder="Additional description or notes about this indicator"
            />
          </el-form-item>
        </el-card>

        <!-- Actions -->
        <div class="form-actions">
          <el-button @click="handleCancel">Cancel</el-button>
          <el-button
            type="primary"
            :loading="submitting"
            @click="handleSubmit"
          >
            {{ submitting ? 'Creating...' : 'Create Indicator' }}
          </el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<style scoped>
.metric-create-page {
  max-width: 900px;
  margin: 0 auto;
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

.advanced-toggle {
  text-align: center;
  margin-bottom: 16px;
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
