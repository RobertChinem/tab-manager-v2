import ContentActions from "./content-actions"

type Tab = {
  id: number
  windowId: number
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

  focusTab(tabId: number, windowId: number): Promise<void>

  invokeContentAction<T extends keyof ContentActions>(
    tabId: number,
    action: T,
    ...params: Parameters<ContentActions[T]>): Promise<ReturnType<ContentActions[T]>>
}

export { Tab, Service }
