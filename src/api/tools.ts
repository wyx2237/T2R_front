import client from './client'
import type { AtomicTool } from '@/types/tool'

export function getTools(): Promise<AtomicTool[]> {
  return client.get('/api/tools').then((res) => res.data)
}
