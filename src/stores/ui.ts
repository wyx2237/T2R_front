import { defineStore } from 'pinia'

const FONT_KEY = 'claude-font-display'

const fontMap: Record<string, string> = {
  Inter: "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif",
  'IBM Plex Sans': "'IBM Plex Sans', system-ui, -apple-system, 'Segoe UI', sans-serif",
  'DM Sans': "'DM Sans', system-ui, -apple-system, 'Segoe UI', sans-serif",
}

interface UiState {
  sidebarCollapsed: boolean
  displayFont: string
}

function loadFont(): string {
  const saved = localStorage.getItem(FONT_KEY)
  if (saved && fontMap[saved]) return saved
  return 'Inter'
}

function applyFont(font: string) {
  const family = fontMap[font]
  if (family) {
    document.documentElement.style.setProperty('--font-display', family)
  }
}

export const useUiStore = defineStore('ui', {
  state: (): UiState => ({
    sidebarCollapsed: false,
    displayFont: loadFont(),
  }),

  actions: {
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed
    },

    setDisplayFont(font: string) {
      if (!fontMap[font]) return
      this.displayFont = font
      localStorage.setItem(FONT_KEY, font)
      applyFont(font)
    },

    initFont() {
      applyFont(this.displayFont)
    },
  },
})
