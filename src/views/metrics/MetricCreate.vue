<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { createMetric, type CreateMetricData } from '@/api/metrics'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

const router = useRouter()
const formRef = ref<FormInstance>()
const submitting = ref(false)
const creating = ref(false)
const creationStep = ref(-1)

const creationSteps = [
  { label: 'Question Decomposition', desc: 'Break down the question into atomic step sequences', icon: 'Search' },
  { label: 'Workflow Modeling', desc: 'Integrate step inputs and outputs into a complete workflow', icon: 'Operation' },
  { label: 'Dependency Verification', desc: 'Verify the correctness of step dependency relationships', icon: 'Connection' },
  { label: 'Code Synthesis', desc: 'Synthesize executable code for each step', icon: 'Finished' },
]

const form = reactive<CreateMetricData>({
  question: '',
  formula: '',
})

const rules: FormRules = {
  question: [
    { required: true, message: 'Please describe what indicator you want to create', trigger: 'blur' },
    { min: 10, message: 'Description should be at least 10 characters', trigger: 'blur' },
  ],
  formula: [
    { required: true, message: 'Please enter the formula', trigger: 'blur' },
  ],
}

async function handleSubmit() {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
  } catch {
    return
  }

  creating.value = true
  creationStep.value = -1

  // Run stages animation in parallel with API call
  const apiPromise = createMetric({
    question: form.question,
    formula: form.formula || undefined,
  })

  // Animate through stages
  for (let i = 0; i < creationSteps.length; i++) {
    creationStep.value = i
    const delay = 4000 + Math.random() * 2000 // 4-6s per stage
    await new Promise((resolve) => setTimeout(resolve, delay))
  }

  // Wait for API if it hasn't finished yet
  try {
    const { metricId } = await apiPromise
    ElMessage.success('Indicator created successfully')
    router.push(`/metrics/${metricId}`)
  } catch {
    ElMessage.error('Failed to create indicator')
    creating.value = false
  }
}

function handleCancel() {
  router.push('/metrics')
}
</script>

<template>
  <div class="metric-create-page">
    <!-- Creating Animation -->
    <el-card v-if="creating" class="creating-card">
      <div class="creating-spinner">
        <div class="creating-ring" />
        <el-icon :size="36" class="creating-icon"><DataAnalysis /></el-icon>
      </div>
      <h3 class="creating-title">Creating Indicator</h3>
      <p class="creating-subtitle">Processing your request through the pipeline</p>
      <div class="creating-steps">
        <div
          v-for="(step, i) in creationSteps"
          :key="i"
          class="creation-step"
          :class="{
            done: i < creationStep,
            current: i === creationStep,
            pending: i > creationStep,
          }"
        >
          <span class="creation-step-icon">
            <template v-if="i < creationStep">&#10003;</template>
            <template v-else-if="i === creationStep">
              <span class="creation-step-dot" />
            </template>
            <template v-else><span class="creation-step-circle" /></template>
          </span>
          <div class="creation-step-label-group">
            <span class="creation-step-label">{{ step.label }}</span>
            <span class="creation-step-desc">{{ step.desc }}</span>
          </div>
        </div>
      </div>
    </el-card>

    <div v-if="!creating" class="page-content">
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
            <div class="region-header">
              <el-icon :size="22"><EditPen /></el-icon>
              <span>Indicator Definition</span>
            </div>
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
              :rows="6"
              placeholder="e.g., eGFR = 142 × min(Scr/κ, 1)^α × max(Scr/κ, 1)^(-1.200) × 0.9938^Age × 1.012 [if female]"
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
  color: var(--claude-text-dark);
}

.page-subtitle {
  margin: 0 0 24px 0;
  font-size: 14px;
  color: var(--claude-text-light);
  line-height: 1.6;
}

.form-section {
  margin-bottom: 16px;
}

.section-title {
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 600;
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

/* ── Creating animation ── */
.creating-card {
  margin-top: 24px;
}

.creating-spinner {
  position: relative;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 24px auto 20px;
}

.creating-ring {
  position: absolute;
  width: 80px;
  height: 80px;
  border: 4px solid var(--claude-border);
  border-top-color: var(--claude-orange);
  border-radius: 50%;
  animation: creating-spin 1s linear infinite;
}

@keyframes creating-spin {
  to { transform: rotate(360deg); }
}

.creating-icon {
  color: var(--claude-orange);
}

.creating-title {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 700;
  color: var(--claude-text-dark);
  text-align: center;
  margin: 0 0 6px 0;
}

.creating-subtitle {
  font-size: 14px;
  color: var(--claude-text-light);
  text-align: center;
  margin: 0 0 32px 0;
}

.creating-steps {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 520px;
  margin: 0 auto;
  padding-bottom: 32px;
}

.creation-step {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}

.creation-step-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
}

.creation-step.done .creation-step-icon {
  color: #C9944A;
  font-size: 18px;
  font-weight: 700;
}

.creation-step-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--claude-orange);
  animation: creation-pulse 1s ease-in-out infinite;
}

.creation-step-circle {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid var(--claude-border);
}

.creation-step-label-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.creation-step-label {
  font-size: 15px;
  color: var(--claude-text-mid);
  font-weight: 600;
}

.creation-step-desc {
  font-size: 12px;
  color: var(--claude-text-light);
  line-height: 1.4;
}

.creation-step.done .creation-step-label {
  color: #C9944A;
}

.creation-step.done .creation-step-desc {
  color: #C9944A;
  opacity: 0.75;
}

.creation-step.current .creation-step-label {
  color: var(--claude-text-dark);
}

.creation-step.current .creation-step-desc {
  color: var(--claude-text-mid);
}

@keyframes creation-pulse {
  0%, 100% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.4); opacity: 1; }
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
