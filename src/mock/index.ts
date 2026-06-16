import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import { atomicTools } from './tools'
import { metrics } from './metrics'
import { uploadResponse, computeResponse } from './sessions'

const mock = new MockAdapter(axios, { delayResponse: 300 })

// 包装为后端统一的 ResponseModel 格式 { message, data, status_code }
function ok(data: unknown) {
  return [200, { message: 'ok', data, status_code: 200 }]
}

// Tool library — all 8 templates
mock.onGet('/api/tools').reply(() => ok(atomicTools))

// Metrics — list with filtering
mock.onGet('/api/metrics').reply((config) => {
  const keyword = config.params?.keyword?.toLowerCase() || ''
  const department = config.params?.department || ''
  const page = parseInt(config.params?.page || '1', 10)
  const pageSize = parseInt(config.params?.pageSize || '20', 10)

  let filtered = [...metrics]

  if (keyword) {
    filtered = filtered.filter(
      (m) =>
        m.name.toLowerCase().includes(keyword) ||
        m.code.toLowerCase().includes(keyword)
    )
  }
  if (department) {
    filtered = filtered.filter((m) => m.department === department)
  }

  const total = filtered.length
  const start = (page - 1) * pageSize
  const items = filtered.slice(start, start + pageSize)

  return ok({ items, total })
})

// Metrics — detail by ID
mock.onGet(/\/api\/metrics\/\w+$/).reply((config) => {
  const id = config.url!.split('/').pop()
  const metric = metrics.find((m) => m.id === id)
  if (metric) {
    return ok(metric)
  }
  return [404, { message: 'Metric not found', data: null, status_code: 404 }]
})

// Metrics — delete
mock.onDelete(/\/api\/metrics\/\w+$/).reply(() => ok({ success: true }))

// Metrics — create (placeholder)
mock.onPost('/api/metrics').reply(() => ok({ success: true }))

// Metrics — update (placeholder)
mock.onPut(/\/api\/metrics\/\w+$/).reply(() => ok({ success: true }))

// Compute — upload case file
mock.onPost('/api/compute/sessions').reply(() =>
  ok({
    session: {
      ...uploadResponse,
      selectedMetricId: null,
      results: [],
      currentStep: 'select',
      createdAt: new Date().toISOString(),
    },
    standard_metrics: metrics.filter((m) => m.id !== 'metric_006' && m.id !== 'metric_007'),
  })
)

// Compute — execute: 后端返回单个 MetricComputeResult，前端映射为数组
mock.onPost(/\/api\/compute\/sessions\/.+\/execute/).reply(() => ok(computeResponse))

// Compute — export report: 后端返回 markdown 文本
mock.onGet(/\/api\/compute\/sessions\/.+\/export/).reply(() =>
  ok({ markdown: '# 计算报告\n\nMock 报告内容' })
)

export { atomicTools, metrics, uploadResponse, computeResponse }
