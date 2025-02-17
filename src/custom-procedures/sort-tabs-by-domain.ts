import * as Browser from '../shared/types/browser'
import CustomProcedure from '../shared/types/custom-procedure'
import Request from '../shared/types/request'
import * as UI from '../shared/types/ui'

export default class SortTabsByDomain implements CustomProcedure {
  private readonly browserService: Browser.Service

  constructor(browserService: Browser.Service) {
    this.browserService = browserService
  }

  getDescription(): string {
    return 'Sort Tabs By Domain'
  }

  getName(): string {
    return 'tabs.sortByDomain'
  }

  async handle(request: Request<UI.Page>): Promise<UI.Page> {
    const pressedKeys = request.data?.metadata?.pressedKeys || []

    if (pressedKeys.includes('Enter')) {
      await this.sortTabsByDomain()
    }

    return { sections: [] }
  }

  private async sortTabsByDomain(): Promise<void> {
    const currentWindowId = await this.browserService.getCurrentWindowId()
    const tabs = await this.browserService.getTabsFromCurrentWindow()
    const sortedTabs = tabs.sort((a, b) => a.url.localeCompare(b.url))
    let index = 0
    for (const tab of sortedTabs) {
      await this.browserService.moveTab(tab.id, currentWindowId, index++)
    }
  }
}
