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
const uploading = ref(false)

const stepIndex = ref(0)

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
  file.value = uploadFile.raw || null
}

async function handleSubmit() {
  if (!file.value) {
    ElMessage.warning('Please select a file first')
    return
  }

  uploading.value = true
  try {
    await computeStore.uploadCase(file.value)
    router.push(`/compute/${computeStore.sessionId}/select`)
  } catch {
    ElMessage.error('Failed to parse case file')
  } finally {
    uploading.value = false
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
        <span class="section-title">Upload Case Data</span>
      </template>

      <el-upload
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

      <div class="upload-actions">
        <el-button @click="handleReset" :disabled="!file && !computeStore.sessionId">
          Reset
        </el-button>
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
        <span class="section-title">Sample Files</span>
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
  font-size: 15px;
  font-weight: 600;
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
  color: #303133;
  margin: 0 0 8px 0;
}

.upload-hint {
  font-size: 13px;
  color: #909399;
  margin: 0 0 4px 0;
}

.upload-sub {
  font-size: 12px;
  color: #C0C4CC;
  margin: 0;
}

.upload-actions {
  display: flex;
  justify-content: flex-end;
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
