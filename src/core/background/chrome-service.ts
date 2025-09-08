import * as Browser from '../../shared/types/browser'
import ContentActions from '../../shared/types/content-actions'

export default class ChromeService implements Browser.Service {
  async getAllWindowIds(): Promise<number[]> {
    return chrome.windows
      .getAll()
      .then((windows) => windows.map((w) => w.id || 0))
  }

  async getTabsFromCurrentWindow(): Promise<Browser.Tab[]> {
    return chrome.tabs
      .query({ currentWindow: true })
      .then((tabs) =>
        tabs.map((t) => ({
          id: t.id || 0,
          windowId: t.windowId || 0,
          url: t.url || '',
          index: t.index
        })),
      )
  }

  async getCurrentWindowId(): Promise<number> {
    return chrome.tabs
      .query({ currentWindow: true })
      .then((tabs) => tabs[0]?.windowId || 0)
  }

  async createTabGroup(name: string, tabIds: number[]): Promise<void> {
    const groupId = await chrome.tabs.group({ tabIds })
    await chrome.tabGroups.update(groupId, { title: name, collapsed: true })
  }

  async getTabsFromWindow(id: number): Promise<Browser.Tab[]> {
    return chrome.tabs
      .query({ windowId: id })
      .then((tabs) =>
        tabs.map((t) => ({
          id: t.id || 0,
          windowId: t.windowId || 0,
          url: t.url || '',
          index: t.index
        })),
      )
  }

  async moveTab(tabId: number, windowId: number, index: number): Promise<void> {
    await chrome.tabs.move(tabId, { windowId, index })
  }

  async createWindow(tabIds: number[]): Promise<void> {
    const [first, ...rest] = tabIds
    const window = await chrome.windows.create({
      tabId: first,
      focused: true,
    })

    let index = 1
    for (const tabId of rest) {
      await this.moveTab(tabId, window.id || 0, index++)
    }
  }

  async ungroupTab(tabId: number): Promise<void> {
    await chrome.tabs.ungroup(tabId)
  }

  async focusTab(tabId: number, windowId: number): Promise<void> {
    await chrome.tabs.update(tabId, { active: true })
    await chrome.windows.update(windowId, { focused: true })
  }

  async invokeContentAction<T extends keyof ContentActions>(
    tabId: number,
    action: T,
    ...params: Parameters<ContentActions[T]>): Promise<ReturnType<ContentActions[T]>> {
    return new Promise((resolve, reject) => {
      chrome.tabs.sendMessage(tabId, { action, params }, (response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError)
        } else {
          resolve(response)
        }
      })
    })
  }
}
