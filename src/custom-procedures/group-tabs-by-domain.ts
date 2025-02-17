import * as Browser from '../shared/types/browser'
import CustomProcedure from '../shared/types/custom-procedure'
import Request from '../shared/types/request'
import * as UI from '../shared/types/ui'
import * as Utils from '../shared/utils'

export default class GroupTabsByDomain implements CustomProcedure {
  private readonly browserService: Browser.Service

  constructor(browserService: Browser.Service) {
    this.browserService = browserService
  }

  getDescription(): string {
    return 'Group Tabs By Domain'
  }

  getName(): string {
    return 'tabs.groupByDomain'
  }

  async handle(request: Request<UI.Page>): Promise<UI.Page> {
    const pressedKeys = request.data?.metadata?.pressedKeys || []

    if (pressedKeys.includes('Enter')) {
      await this.groupTabsByDomain()
    }

    return { sections: [] }
  }

  private async groupTabsByDomain(): Promise<void> {
    const tabs = await this.browserService.getTabsFromCurrentWindow()
    const tabsByDomain = new Map<string, Browser.Tab[]>()

    for (const tab of tabs) {
      const domain = Utils.getDomainFromURL(tab.url)
      if (!tabsByDomain.has(domain)) {
        tabsByDomain.set(domain, [])
      }
      tabsByDomain.get(domain)?.push(tab)
    }

    for (const [domain, tabs] of tabsByDomain.entries()) {
      const groupName = domain.includes('.')
        ? domain.split('.').slice(0, -1).join('.')
        : domain
      await this.browserService.createTabGroup(
        groupName,
        tabs.map(({ id }) => id),
      )
    }
  }
}
