type Tab = {
  id: number
  url: string
  index: number
  title?: string
  windowId?: number
}

type TabMatch = {
  pre: string
  match: string
  post: string
}

interface Service {
  getTabsFromCurrentWindow(): Promise<Tab[]>

  getTabsFromWindow(id: number): Promise<Tab[]>

  getTabsFromAllWindows(): Promise<Tab[]>

  getCurrentWindowId(): Promise<number>

  createTabGroup(name: string, tabIds: number[]): Promise<void>

  getAllWindowIds(): Promise<number[]>

  moveTab(tabId: number, windowId: number, index: number): Promise<void>

  createWindow(tabIds: number[]): Promise<void>

  ungroupTab(tabId: number): Promise<void>

  findInTabs(
    tabIds: number[],
    term: string,
    maxMatches: number,
  ): Promise<Map<number, TabMatch[]>>

  activateTab(tabId: number, windowId: number): Promise<void>
}

export { Tab, TabMatch, Service }
