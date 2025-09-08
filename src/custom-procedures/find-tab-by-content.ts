import * as UI from '../shared/types/ui'
import Request from '../shared/types/request'
import CustomProcedure from '../shared/types/custom-procedure'
import * as Browser from '../shared/types/browser'
import * as Utils from '../shared/utils'

class TabSwitchButtonId {
  static SWITCH_TO_TAB_PREFIX = 'button-switch-to-'

  static buildId(tab: Browser.Tab): string {
    return `${TabSwitchButtonId.SWITCH_TO_TAB_PREFIX}${JSON.stringify({ id: tab.id, windowId: tab.windowId })}`
  }

  static parseId(id: string): { id: number, windowId: number } | null {
    if (!id.startsWith(TabSwitchButtonId.SWITCH_TO_TAB_PREFIX)) {
      return null
    }
    try {
      return JSON.parse(id.replace(TabSwitchButtonId.SWITCH_TO_TAB_PREFIX, ''))
    } catch {
      return null
    }
  }
}

export default class FindTabByContent implements CustomProcedure {
  private static INPUT_SEARCH_ID: string = 'input-search'
  private static INPUT_DOMAIN_ID: string = 'input-domain'
  private static MAX_RESULTS = 4
  private readonly browserService: Browser.Service

  constructor(browserService: Browser.Service) {
    this.browserService = browserService
  }

  getDescription(): string {
    return 'Find Tab By Content'
  }
  getName(): string {
    return 'tabs.findByContent'
  }

  async handle(request: Request<UI.Page>): Promise<UI.Page> {
    const page = request.data!
    const pressedKeys = request.data?.metadata?.pressedKeys || []
    const clickedId = request.data?.metadata?.clickedId || ''
    const firstGoButton =
      page
        .sections
        .flatMap(s => s.elements)
        .map(a => a.button)
        .filter(button => !!button && button.id.startsWith(TabSwitchButtonId.SWITCH_TO_TAB_PREFIX))[0]

    if (pressedKeys.includes('Enter') && firstGoButton) {
      this.goToTab(TabSwitchButtonId.parseId(firstGoButton.id)!!)
      return page
    }

    if (clickedId.startsWith(TabSwitchButtonId.SWITCH_TO_TAB_PREFIX)) {
      this.goToTab(TabSwitchButtonId.parseId(clickedId)!!)
      return page
    }

    const inputSearchValue =
      Utils.getInput(FindTabByContent.INPUT_SEARCH_ID, page)?.value || ''
    const inputDomainValue =
      Utils.getInput(FindTabByContent.INPUT_DOMAIN_ID, page)?.value || ''

    const innerTexts = await this.getInnerTexts()
    const results =
      innerTexts
        .filter(({ tab }) => {
          if (inputDomainValue.length === 0) {
            return true
          }
          return Utils.getDomainFromURL(tab.url).startsWith(inputDomainValue)
        })
        .map(({ tab, innerText }) => ({
          tab,
          slices: this.findTextSlices(innerText, inputSearchValue)
        }))
        .filter(({ slices }) => slices.length > 0)
        .sort((a, b) => a.tab.url.localeCompare(b.tab.url))

    return {
      sections: [
        {
          elements: [
            {
              input: {
                id: FindTabByContent.INPUT_SEARCH_ID,
                placeholder: 'Enter search text',
                value: inputSearchValue,
              }
            },
            {
              input: {
                id: FindTabByContent.INPUT_DOMAIN_ID,
                placeholder: 'Enter domain',
                value: inputDomainValue,
              },
            },
          ]
        },
        ...results.map(({ tab, slices }) => this.buildSection(tab, slices)),
      ]
    }
  }

  private buildSection(tab: Browser.Tab, slices: string[]): UI.Section {
    return {
      className: 'bg-zinc-100 p-2 rounded',
      elements: [
        {
          text: {
            text: Utils.getDomainFromURL(tab.url),
            className: 'font-bold text-sm'
          }

        },
        {
          text: {
            text: tab.url,
            className: 'font-medium text-sm'
          }

        },
        ...slices.slice(0, FindTabByContent.MAX_RESULTS).map(slice => ({
          text: {
            text: slice,
            className: 'font-thin text-xs'
          }
        })),
        {
          button: {
            id: TabSwitchButtonId.buildId(tab),
            text: {
              text: 'Go',
            },
            className: 'text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded text-sm py-1',
          }
        },
      ]
    }
  }

  private goToTab({ id, windowId }: { id: number, windowId: number }) {
    this.browserService.focusTab(id, windowId)
  }

  private findTextSlices(text: string, target: string, numWords = 3) {
    if (target.length === 0) {
      return []
    }

    const results = []
    const words = text.split(/\s+/) // split by whitespace
    const lowerWords = words.map(w => w.toLowerCase())
    const lowerTarget = target.toLowerCase()

    for (let i = 0; i < words.length; i++) {
      if (lowerWords[i].includes(lowerTarget)) {
        const start = Math.max(0, i - numWords)
        const end = Math.min(words.length, i + numWords + 1)
        results.push(words.slice(start, end).join(" "))
      }
    }

    return results
  }

  private async getInnerTexts(): Promise<{ tab: Browser.Tab, innerText: string }[]> {
    const results: { tab: Browser.Tab, innerText: string }[] = []

    for (const windowId of await this.browserService.getAllWindowIds()) {
      for (const tab of await this.browserService.getTabsFromWindow(windowId)) {
        const innerText = await this.getInnerTextFromTab(tab.id).catch(() => '')
        results.push({ tab, innerText })
      }
    }

    return results
  }

  private async getInnerTextFromTab(tabId: number): Promise<string> {
    return this.browserService.invokeContentAction(tabId, 'getInnerText')
      .then(response => response.innerText || '')
  }
}
