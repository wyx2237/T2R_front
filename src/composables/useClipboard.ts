import { ElMessage } from 'element-plus'

export function useClipboard() {
  async function copy(text: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text)
      ElMessage.success('Copied to clipboard')
      return true
    } catch {
      ElMessage.error('Failed to copy')
      return false
    }
  }

  return { copy }
}
