import * as Browser from '../shared/types/browser'
import CustomProcedure from '../shared/types/custom-procedure'
import Request from '../shared/types/request'
import * as UI from '../shared/types/ui'

export default class UngroupTabs implements CustomProcedure {
  private readonly browserService: Browser.Service

  constructor(browserService: Browser.Service) {
    this.browserService = browserService
  }

  getDescription(): string {
    return 'Ungroup Tabs'
  }

  getName(): string {
    return 'tabs.ungroup'
  }

  async handle(request: Request<UI.Page>): Promise<UI.Page> {
    const pressedKeys = request.data?.metadata?.pressedKeys || []

    if (pressedKeys.includes('Enter')) {
      await this.ungroupTabs()
    }

    return { sections: [] }
  }

  private async ungroupTabs() {
    const tabs = await this.browserService.getTabsFromCurrentWindow()
    for (const tab of tabs) {
      await this.browserService.ungroupTab(tab.id)
    }
  }
}
