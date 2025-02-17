type Tab = {
  id: number
  url: string
  index: number
}

interface Service {
  getTabsFromCurrentWindow(): Promise<Tab[]>

  getTabsFromWindow(id: number): Promise<Tab[]>

  getCurrentWindowId(): Promise<number>

  createTabGroup(name: string, tabIds: number[]): Promise<void>

  getAllWindowIds(): Promise<number[]>

  moveTab(tabId: number, windowId: number, index: number): Promise<void>

  createWindow(tabIds: number[]): Promise<void>

  ungroupTab(tabId: number): Promise<void>
}

export { Tab, Service }
