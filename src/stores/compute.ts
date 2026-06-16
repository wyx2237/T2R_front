import { defineStore } from 'pinia'
import type { MetricComputeResult } from '@/types/compute'
import type { Metric } from '@/types/metric'
import { uploadCaseFile, executeCompute as apiExecuteCompute } from '@/api/compute'

interface ComputeState {
  sessionId: string | null
  rawText: string
  availableMetrics: Metric[]
  selectedMetricId: string | null
  results: MetricComputeResult[]
  currentStep: 'upload' | 'select' | 'result'
}

export const useComputeStore = defineStore('compute', {
  state: (): ComputeState => ({
    sessionId: null,
    rawText: '',
    availableMetrics: [],
    selectedMetricId: null,
    results: [],
    currentStep: 'upload',
  }),

  actions: {
    async uploadCase(file: File) {
      const response = await uploadCaseFile(file)
      this.sessionId = response.sessionId
      this.rawText = response.rawText
      this.availableMetrics = response.availableMetrics || []
      this.currentStep = 'select'
    },

    async executeCompute() {
      if (!this.sessionId || !this.selectedMetricId) return
      const response = await apiExecuteCompute(this.sessionId, this.selectedMetricId, this.rawText)
      this.results = response.results
      this.currentStep = 'result'
    },

    resetToUpload() {
      this.$reset()
    },

    backToSelect() {
      this.selectedMetricId = null
      this.results = []
      this.currentStep = 'select'
    },
  },
})
