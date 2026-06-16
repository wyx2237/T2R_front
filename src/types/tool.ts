export interface MetaInfo {
  Name: string
  Description: string
  Scope: string
}

export interface FlowItem {
  Description: string
  Example: Record<string, unknown>
}

export interface FlowInfo {
  Input: FlowItem
  Output: FlowItem
}

export interface ExecInfo {
  Language: string
  Library: string[]
  Logic: string[]
}

export interface ToolExample {
  ToolName: string
  Parameters: Record<string, unknown>
  Code: string
  Output: Record<string, unknown>
}

export interface AtomicTool {
  id: string
  MetaInfo: MetaInfo
  FlowInfo: FlowInfo
  ExecInfo: ExecInfo
  Examples: ToolExample[]
}
