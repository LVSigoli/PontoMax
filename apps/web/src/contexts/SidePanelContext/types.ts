export interface SidePanelContextValue {
  activeSidePanelId: string | null
  closeSidePanel: () => void
  openSidePanel: (id: string) => void
}
