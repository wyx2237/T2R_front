import client from './client'
import type { Metric } from '@/types/metric'
import type { MetricComputeResult, ComputeSession } from '@/types/compute'

export interface UploadResponse {
  sessionId: string
  rawText: string
  availableMetrics: Metric[]
}

export interface ExecuteResponse {
  results: MetricComputeResult[]
}

/**
 * 上传病例文件，创建计算会话。
 * 后端返回 { session: ComputeSession, standard_metrics: Metric[] }，
 * 这里映射为前端期望的扁平结构。
 */
export function uploadCaseFile(file: File): Promise<UploadResponse> {
  const formData = new FormData()
  formData.append('file', file)
  return client.post('/api/compute/sessions', formData).then((res) => {
    const data = res.data as { session: ComputeSession; standard_metrics: Metric[] }
    return {
      sessionId: data.session.sessionId,
      rawText: data.session.rawText,
      availableMetrics: (data.standard_metrics || []).filter(Boolean),
    }
  })
}

export function getSession(id: string): Promise<ComputeSession> {
  return client.get(`/api/compute/sessions/${id}`).then((res) => res.data)
}

/**
 * 执行计算。
 * 后端返回单个 MetricComputeResult，mock 返回 { results: [...] }，
 * 这里统一包装为前端期望的 { results: [...] } 格式。
 */
export function executeCompute(
  sessionId: string,
  metricId: string,
  rawText: string,
): Promise<ExecuteResponse> {
  return client
    .post(`/api/compute/sessions/${sessionId}/execute`, { metricId, rawText })
    .then((res) => {
      const data = res.data as MetricComputeResult | ExecuteResponse
      // 如果已经是 { results: [...] } 格式（mock 数据），直接返回
      if (data && typeof data === 'object' && 'results' in data) {
        return data as ExecuteResponse
      }
      // 后端返回单个结果对象，包装为数组
      return { results: [data as MetricComputeResult] }
    })
}

/**
 * 导出计算报告。
 * 后端返回 JSON { markdown: string }。
 */
export function exportReport(sessionId: string): Promise<{ markdown: string }> {
  return client.get(`/api/compute/sessions/${sessionId}/export`).then((res) => res.data)
}
