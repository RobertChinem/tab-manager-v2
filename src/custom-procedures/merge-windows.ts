import * as Browser from '../shared/types/browser'
import CustomProcedure from '../shared/types/custom-procedure'
import Request from '../shared/types/request'
import * as UI from '../shared/types/ui'

export default class MergeWindows implements CustomProcedure {
  private readonly browserService: Browser.Service

  constructor(browserService: Browser.Service) {
    this.browserService = browserService
  }

  getDescription(): string {
    return 'Merge Windows'
  }

  getName(): string {
    return 'windows.merge'
  }

  async handle(request: Request<UI.Page>): Promise<UI.Page> {
    const pressedKeys = request.data?.metadata?.pressedKeys || []

    if (pressedKeys.includes('Enter')) {
      await this.mergeWindows(await this.browserService.getAllWindowIds())
    }

    return { sections: [] }
  }

  private async mergeWindows(windowIds: number[]): Promise<void> {
    let tabsToMerge: Browser.Tab[] = []

    for (const windowId of windowIds) {
      const tabs = await this.browserService.getTabsFromWindow(windowId)
      tabsToMerge = [...tabsToMerge, ...tabs]
    }

    let index = 0
    const currentWindowId = await this.browserService.getCurrentWindowId()
    for (const tab of tabsToMerge) {
      await this.browserService.moveTab(tab.id, currentWindowId, index++)
    }
  }
}
