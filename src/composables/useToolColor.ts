const ACCENT_COLORS = [
  '#409EFF',
  '#52C41A',
  '#FAAD14',
  '#FF4D4F',
  '#722ED1',
  '#13C2C2',
  '#EB2F96',
  '#FA8C16',
]

export function toolAccentColor(toolId: string): string {
  const num = parseInt(toolId.split('_').pop() || '1', 10)
  return ACCENT_COLORS[(num - 1) % ACCENT_COLORS.length]
}
