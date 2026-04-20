import * as Browser from '../../shared/types/browser'

const SNIPPET_PADDING = 80

export default class ChromeService implements Browser.Service {
  async getAllWindowIds(): Promise<number[]> {
    return chrome.windows
      .getAll()
      .then((windows) => windows.map((w) => w.id || 0))
  }

  async getTabsFromCurrentWindow(): Promise<Browser.Tab[]> {
    return chrome.tabs
      .query({ currentWindow: true })
      .then((tabs) => tabs.map(toTab))
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
    return chrome.tabs.query({ windowId: id }).then((tabs) => tabs.map(toTab))
  }

  async getTabsFromAllWindows(): Promise<Browser.Tab[]> {
    return chrome.tabs.query({}).then((tabs) => tabs.map(toTab))
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

  async findInTabs(
    tabIds: number[],
    term: string,
    maxMatches: number,
  ): Promise<Map<number, Browser.TabMatch[]>> {
    const entries = await Promise.all(
      tabIds.map(async (tabId) => {
        try {
          const injected = await chrome.scripting.executeScript({
            target: { tabId, allFrames: false },
            world: 'MAIN',
            func: findAllMatchesInPage,
            args: [term, maxMatches, SNIPPET_PADDING],
          })
          const result = injected[0]?.result as Browser.TabMatch[] | undefined
          return [tabId, result ?? []] as const
        } catch {
          return [tabId, [] as Browser.TabMatch[]] as const
        }
      }),
    )
    return new Map(entries)
  }

  async activateTab(tabId: number, windowId: number): Promise<void> {
    try {
      await chrome.tabs.update(tabId, { active: true })
      await chrome.windows.update(windowId, { focused: true })
    } catch {
      // Tab or window may have been closed — no-op.
    }
  }
}

function toTab(t: chrome.tabs.Tab): Browser.Tab {
  return {
    id: t.id || 0,
    url: t.url || '',
    index: t.index,
    title: t.title || '',
    windowId: t.windowId || 0,
  }
}

// Runs in the target page's MAIN world. Must be self-contained — no closures,
// no references to outer symbols. Returns TabMatch[].
function findAllMatchesInPage(
  term: string,
  maxMatches: number,
  snippetPadding: number,
): { pre: string; match: string; post: string }[] {
  if (!term || term.length === 0) return []

  const selection = window.getSelection()
  if (!selection) return []

  const savedRanges: Range[] = []
  for (let i = 0; i < selection.rangeCount; i++) {
    savedRanges.push(selection.getRangeAt(i).cloneRange())
  }
  const savedScrollX = window.scrollX
  const savedScrollY = window.scrollY
  const savedActive = document.activeElement as HTMLElement | null

  selection.removeAllRanges()

  const results: { pre: string; match: string; post: string }[] = []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const find = (window as any).find as
    | ((
        str: string,
        caseSensitive?: boolean,
        backwards?: boolean,
        wrapAround?: boolean,
        wholeWord?: boolean,
        searchInFrames?: boolean,
        showDialog?: boolean,
      ) => boolean)
    | undefined

  if (typeof find !== 'function') {
    return []
  }

  while (results.length < maxMatches) {
    const found = find(term, false, false, false, false, true, false)
    if (!found) break

    if (selection.rangeCount === 0) break
    const range = selection.getRangeAt(0)
    const node = range.startContainer
    const text = node.textContent || ''
    const start = range.startOffset
    const end = range.endOffset

    const preStart = Math.max(0, start - snippetPadding)
    const postEnd = Math.min(text.length, end + snippetPadding)
    const pre = (preStart > 0 ? '…' : '') + text.slice(preStart, start)
    const match = text.slice(start, end)
    const post = text.slice(end, postEnd) + (postEnd < text.length ? '…' : '')

    results.push({
      pre: pre.replace(/\s+/g, ' '),
      match,
      post: post.replace(/\s+/g, ' '),
    })

    selection.collapseToEnd()
  }

  selection.removeAllRanges()
  for (const r of savedRanges) selection.addRange(r)
  window.scrollTo(savedScrollX, savedScrollY)
  if (savedActive && typeof savedActive.focus === 'function') {
    try {
      savedActive.focus({ preventScroll: true })
    } catch {
      // ignore
    }
  }

  return results
}
