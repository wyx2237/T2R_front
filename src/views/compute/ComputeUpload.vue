<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useComputeStore } from '@/stores/compute'
import type { UploadFile, UploadRawFile } from 'element-plus'
import { ElMessage } from 'element-plus'
import ComputeSteps from '@/components/compute/ComputeSteps.vue'

const router = useRouter()
const computeStore = useComputeStore()

const file = ref<File | null>(null)
const fileContent = ref('')
const uploading = ref(false)
const analyzing = ref(false)

const stepIndex = ref(0)

const analysisSteps = [
  'Extracting key entities from case data...',
  'Matching entities to available indicators...',
  'Ranking best-fit indicators...',
]
const currentAnalysisStep = ref(-1)

function readFileContent(rawFile: File) {
  const reader = new FileReader()
  reader.onload = () => {
    fileContent.value = reader.result as string
  }
  reader.readAsText(rawFile)
}

function beforeUpload(rawFile: UploadRawFile): boolean {
  if (!rawFile.name.endsWith('.txt')) {
    ElMessage.warning('Only .txt files are supported')
    return false
  }
  if (rawFile.size > 100 * 1024) {
    ElMessage.warning('File size must not exceed 100KB')
    return false
  }
  return true
}

function handleChange(uploadFile: UploadFile) {
  const raw = uploadFile.raw || null
  file.value = raw
  if (raw) {
    readFileContent(raw)
  }
}

async function handleSubmit() {
  if (!file.value) {
    ElMessage.warning('Please select a file first')
    return
  }

  analyzing.value = true

  try {
    await computeStore.uploadCase(file.value)

    // Simulate analysis steps
    for (let i = 0; i < analysisSteps.length; i++) {
      currentAnalysisStep.value = i
      await new Promise((resolve) => setTimeout(resolve, 1200))
    }

    router.push(`/compute/${computeStore.sessionId}/select`)
  } catch {
    ElMessage.error('Failed to parse case file')
    analyzing.value = false
  }
}

function handleReset() {
  file.value = null
  computeStore.resetToUpload()
}
</script>

<template>
  <div class="compute-upload-page">
    <ComputeSteps :active="stepIndex" />

    <el-card class="upload-card">
      <template #header>
        <div class="region-header">
          <el-icon :size="22"><UploadFilled /></el-icon>
          <span>Upload Case Data</span>
        </div>
      </template>

      <el-upload
        v-if="!file && !analyzing"
        class="upload-zone"
        drag
        accept=".txt"
        :auto-upload="false"
        :limit="1"
        :before-upload="beforeUpload"
        :on-change="handleChange"
      >
        <el-icon class="upload-icon"><UploadFilled /></el-icon>
        <div class="upload-text">
          <p class="upload-title">Upload .txt File</p>
          <p class="upload-hint">Upload plain-text case file (.txt only)</p>
          <p class="upload-sub">Drag file here or click to select</p>
        </div>
      </el-upload>

      <div v-if="analyzing" class="analyzing-card">
        <div class="analyzing-spinner">
          <div class="analyzing-ring" />
          <el-icon :size="32" class="analyzing-icon"><DataAnalysis /></el-icon>
        </div>
        <h3 class="analyzing-title">Analyzing Case Data</h3>
        <div class="analyzing-steps">
          <div
            v-for="(step, i) in analysisSteps"
            :key="i"
            class="analysis-step"
            :class="{
              done: i < currentAnalysisStep,
              current: i === currentAnalysisStep,
              pending: i > currentAnalysisStep,
            }"
          >
            <span class="analysis-step-icon">
              <template v-if="i < currentAnalysisStep">&#10003;</template>
              <template v-else-if="i === currentAnalysisStep">
                <span class="analysis-step-dot" />
              </template>
              <template v-else><span class="analysis-step-circle" /></template>
            </span>
            <span class="analysis-step-label">{{ step }}</span>
          </div>
        </div>
      </div>

      <div v-if="file && !analyzing" class="file-preview">
        <div class="file-preview-header">
          <el-icon><Document /></el-icon>
          <span class="file-name">{{ file.name }}</span>
          <span class="file-size">({{ (file.size / 1024).toFixed(1) }} KB)</span>
        </div>
        <pre class="file-content">{{ fileContent }}</pre>
      </div>

      <div class="upload-actions" v-if="!analyzing">
        <el-button @click="handleReset" :disabled="!file && !computeStore.sessionId">
          Replace Case
        </el-button>
        <div style="flex:1" />
        <el-button
          type="primary"
          :loading="uploading"
          :disabled="!file"
          @click="handleSubmit"
        >
          Submit &rarr;
        </el-button>
      </div>
    </el-card>

    <el-card class="sample-card">
      <template #header>
        <div class="region-header">
          <el-icon :size="22"><FolderOpened /></el-icon>
          <span>Sample Files</span>
        </div>
      </template>
      <p class="sample-desc">No case on hand? Download samples to try:</p>
      <div class="sample-links">
        <a href="/samples/ckd_patient.txt" download class="sample-link">
          <el-button type="primary" text>
            <el-icon><Download /></el-icon>
            Sample 1: ckd_patient.txt
          </el-button>
        </a>
        <a href="/samples/heart_failure_patient.txt" download class="sample-link">
          <el-button type="primary" text>
            <el-icon><Download /></el-icon>
            Sample 2: heart_failure_patient.txt
          </el-button>
        </a>
        <a href="/samples/diabetes_followup.txt" download class="sample-link">
          <el-button type="primary" text>
            <el-icon><Download /></el-icon>
            Sample 3: diabetes_followup.txt
          </el-button>
        </a>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.compute-upload-page {
  max-width: 800px;
  margin: 0 auto;
}

.upload-card,
.sample-card {
  margin-top: 24px;
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

.upload-zone {
  width: 100%;
}

.upload-icon {
  font-size: 48px;
  color: #C0C4CC;
  margin-bottom: 12px;
}

.upload-text {
  text-align: center;
}

.upload-title {
  font-size: 16px;
  color: var(--claude-text-dark);
  margin: 0 0 8px 0;
}

.upload-hint {
  font-size: 13px;
  color: var(--claude-text-light);
  margin: 0 0 4px 0;
}

.upload-sub {
  font-size: 12px;
  color: #C0C4CC;
  margin: 0;
}

.file-preview {
  border: 1px solid var(--claude-border);
  border-radius: 8px;
  overflow: hidden;
}

.file-preview-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: var(--claude-sidebar-bg);
  font-size: 14px;
  font-weight: 600;
  color: var(--claude-text-dark);
}

.file-size {
  font-weight: 400;
  color: var(--claude-text-light);
  font-size: 13px;
}

.file-content {
  margin: 0;
  padding: 16px;
  max-height: 320px;
  overflow-y: auto;
  font-size: 13px;
  line-height: 1.6;
  color: var(--claude-text-dark);
  white-space: pre-wrap;
  word-break: break-word;
  background: #fff;
}

/* ── Analyzing state ── */
.analyzing-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 0;
}

.analyzing-spinner {
  position: relative;
  width: 72px;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.analyzing-ring {
  position: absolute;
  width: 72px;
  height: 72px;
  border: 4px solid var(--claude-border);
  border-top-color: var(--claude-orange);
  border-radius: 50%;
  animation: analyzing-spin 1s linear infinite;
}

@keyframes analyzing-spin {
  to { transform: rotate(360deg); }
}

.analyzing-icon {
  color: var(--claude-orange);
}

.analyzing-title {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 700;
  color: var(--claude-text-dark);
  margin: 0 0 28px 0;
}

.analyzing-steps {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  max-width: 400px;
}

.analysis-step {
  display: flex;
  align-items: center;
  gap: 12px;
}

.analysis-step-icon {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.analysis-step.done .analysis-step-icon {
  color: #C9944A;
  font-size: 16px;
  font-weight: 700;
}

.analysis-step-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--claude-orange);
  animation: dot-pulse 1s ease-in-out infinite;
}

.analysis-step-circle {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid var(--claude-border);
}

.analysis-step-label {
  font-size: 14px;
  color: var(--claude-text-mid);
}

.analysis-step.done .analysis-step-label {
  color: #C9944A;
}

.analysis-step.current .analysis-step-label {
  color: var(--claude-text-dark);
  font-weight: 600;
}

@keyframes dot-pulse {
  0%, 100% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.4); opacity: 1; }
}

.upload-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 20px;
}

.sample-desc {
  font-size: 13px;
  color: #606266;
  margin-bottom: 12px;
}

.sample-links {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sample-link {
  text-decoration: none;
}
</style>
