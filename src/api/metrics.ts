import client from './client'
import type { Metric } from '@/types/metric'

export interface MetricListParams {
  keyword?: string
  department?: string
  page?: number
  pageSize?: number
}

export interface MetricListResponse {
  items: Metric[]
  total: number
}

export function getMetrics(params?: MetricListParams): Promise<MetricListResponse> {
  return client.get('/api/metrics', { params }).then((res) => res.data)
}

export function getMetricById(id: string): Promise<Metric> {
  return client.get(`/api/metrics/${id}`).then((res) => res.data)
}

export function deleteMetric(id: string): Promise<void> {
  return client.delete(`/api/metrics/${id}`)
}

export function createMetric(data: { question: string; formula: string }): Promise<{ metricId: string }> {
  return client.post('/api/metrics', data).then((res) => res.data)
}

export function updateMetric(id: string, data: Partial<Metric>): Promise<{ metricId: string }> {
  return client.put(`/api/metrics/${id}`, data).then((res) => res.data)
}
