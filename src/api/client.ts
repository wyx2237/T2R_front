import axios from 'axios'

const isMock = import.meta.env.VITE_USE_MOCK === 'true'
const baseURL = isMock ? '' : (import.meta.env.VITE_API_BASE_URL || '')

const client = axios.create({ baseURL })

// 响应拦截器：解包后端统一 ResponseModel { message, data, status_code }
// 当 mock 模式时，mock 数据也按 ResponseModel 格式返回，因此统一解包
client.interceptors.response.use(
  (response) => {
    // 如果是 blob 类型（如文件下载），不解包
    if (response.config.responseType === 'blob') {
      return response
    }
    // 解包 ResponseModel.data
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      response.data = response.data.data
    }
    return response
  },
  (error) => {
    return Promise.reject(error)
  },
)

export default client
