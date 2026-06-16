/** 置信度等级 0~5, 整数 */
type ConfidenceLevel = 0 | 1 | 2 | 3 | 4 | 5

export interface ExtractedParam {
  name: string
  rawValue: string
  normalizedValue: string | number
  unit: string
  confidence: ConfidenceLevel
  position: { start: number; end: number }
}

export interface StepTrace {
  order: number
  stepName?: string
  toolId: string
  toolName: string
  description: string
  formulaLatex?: string
  input: Record<string, unknown>
  inputSource: Record<string, {
    sourceType: 'raw' | 'step'
    sourceLabel: string
  }>
  output: Record<string, unknown>
  status: 'success' | 'error'
  errorMessage?: string
}

export interface MetricComputeResult {
  metricId: string
  metricName: string
  metricCode: string
  finalValue: number
  finalUnit: string
  status?: 'normal' | 'borderline' | 'abnormal'
  statusLabel?: string
  referenceRange?: { min: number; max: number }
  steps: StepTrace[]
  extractedParams: ExtractedParam[]
}

export interface ComputeSession {
  sessionId: string
  rawText: string
  selectedMetricId: string | null
  results: MetricComputeResult[]
  currentStep: 'upload' | 'select' | 'result'
  createdAt: string
}

export interface ComputeRequest {
  sessionId: string
  metricId: string
  rawText: string
}

export interface ExportRequest {
  sessionId: string
  format: 'pdf'
}
