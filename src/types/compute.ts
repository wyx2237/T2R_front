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

export interface StepTraceInput {
  input_name: string
  input_value: unknown
  input_unit?: string
  input_source: string
}

export interface StepTraceOutput {
  output_name: string
  output_value: unknown
  output_unit?: string
}

export interface StepTrace {
  order: number
  category: string
  step_name: string
  step_description: string
  step_detail: string
  inputs: StepTraceInput[]
  outputs: StepTraceOutput[]
  status: 'success' | 'error'
  errorMessage?: string
}

export interface MetricComputeResult {
  metricId: string
  metricName: string
  metricCode: string
  finalValue: number
  finalUnit: string
  status?: 'normal' | 'borderline' | 'abnormal' | 'error'
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
