import * as UI from '../shared/types/ui'
import Request from '../shared/types/request'
import CustomProcedure from '../shared/types/custom-procedure'
import * as Browser from '../shared/types/browser'
import * as Utils from '../shared/utils'

const INPUT_TERM_ID = 'input-term'
const INPUT_DOMAIN_ID = 'input-domain'
const MIN_TERM_LENGTH = 2
const MAX_RESULTS = 4

const RESTRICTED_URL_PREFIXES = [
  'chrome://',
  'chrome-extension://',
  'chrome-search://',
  'chrome-devtools://',
  'devtools://',
  'edge://',
  'about:',
  'view-source:',
  'file://',
  'https://chrome.google.com/webstore/',
  'https://chromewebstore.google.com/',
]

class TabSwitchButtonId {
  static PREFIX = 'button-switch-to-'

  static build(tab: Browser.Tab): string {
    return `${TabSwitchButtonId.PREFIX}${JSON.stringify({
      id: tab.id,
      windowId: tab.windowId ?? 0,
    })}`
  }

  static parse(id: string): { id: number; windowId: number } | null {
    if (!id.startsWith(TabSwitchButtonId.PREFIX)) return null
    try {
      return JSON.parse(id.slice(TabSwitchButtonId.PREFIX.length))
    } catch {
      return null
    }
  }
}

export default class FindTabsByTerm implements CustomProcedure {
  private readonly browserService: Browser.Service

  constructor(browserService: Browser.Service) {
    this.browserService = browserService
  }

  getDescription(): string {
    return 'Find Tabs By Term'
  }

  getName(): string {
    return 'tabs.findByTerm'
  }

  async handle(request: Request<UI.Page>): Promise<UI.Page> {
    const page = request.data!
    const pressedKeys = page.metadata?.pressedKeys ?? []
    const clickedId = page.metadata?.clickedId ?? ''

    const clickedCoords = TabSwitchButtonId.parse(clickedId)
    if (clickedCoords) {
      await this.browserService.activateTab(
        clickedCoords.id,
        clickedCoords.windowId ?? 0,
      )
      return { sections: [] }
    }

    if (pressedKeys.includes('Enter')) {
      const firstSwitchButton = page.sections
        .flatMap((s) => s.elements)
        .map((e) => e.button)
        .find((b) => !!b && b.id.startsWith(TabSwitchButtonId.PREFIX))
      if (firstSwitchButton) {
        const coords = TabSwitchButtonId.parse(firstSwitchButton.id)
        if (coords) {
          await this.browserService.activateTab(coords.id, coords.windowId ?? 0)
          return { sections: [] }
        }
      }
      return page
    }

    const term = Utils.getInput(INPUT_TERM_ID, page)?.value ?? ''
    const domain = Utils.getInput(INPUT_DOMAIN_ID, page)?.value ?? ''

    const inputsSection: UI.Section = {
      elements: [
        {
          input: {
            id: INPUT_TERM_ID,
            placeholder: 'Enter term to find',
            value: term,
          },
        },
        {
          input: {
            id: INPUT_DOMAIN_ID,
            placeholder: 'Enter domain',
            value: domain,
          },
        },
      ],
    }

    if (term.length < MIN_TERM_LENGTH) {
      return { sections: [inputsSection] }
    }

    const tabs = (await this.browserService.getTabsFromAllWindows())
      .filter((t) => isInjectableUrl(t.url))
      .filter(
        (t) =>
          domain.length === 0 ||
          Utils.getDomainFromURL(t.url).startsWith(domain),
      )

    const resultsByTab = await this.browserService.findInTabs(
      tabs.map((t) => t.id),
      term,
      MAX_RESULTS,
    )

    const matchedTabs = tabs
      .map((tab) => ({ tab, matches: resultsByTab.get(tab.id) ?? [] }))
      .filter(({ matches }) => matches.length > 0)
      .sort((a, b) => a.tab.url.localeCompare(b.tab.url))

    return {
      sections: [
        inputsSection,
        ...matchedTabs.map(({ tab, matches }) =>
          buildResultSection(tab, matches),
        ),
      ],
    }
  }
}

function buildResultSection(
  tab: Browser.Tab,
  matches: Browser.TabMatch[],
): UI.Section {
  const host = Utils.getDomainFromURL(tab.url)

  const headerElements: UI.Element[] = [
    {
      text: {
        text: host,
        className: 'font-bold text-sm',
      },
    },
    {
      text: {
        text: tab.url,
        className: 'font-medium text-sm truncate',
      },
    },
  ]

  const snippetElements: UI.Element[] = matches
    .slice(0, MAX_RESULTS)
    .map((m) => ({
      text: {
        text: `${m.pre}${m.match}${m.post}`,
        className: 'font-thin text-xs',
      },
    }))

  const buttonElement: UI.Element = {
    button: {
      id: TabSwitchButtonId.build(tab),
      text: { text: 'Go' },
      className:
        'text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded text-sm px-3 py-1',
    },
  }

  return {
    className: 'bg-zinc-100 p-2 rounded',
    elements: [...headerElements, ...snippetElements, buttonElement],
  }
}

function isInjectableUrl(url: string): boolean {
  if (!url) return false
  return !RESTRICTED_URL_PREFIXES.some((p) => url.startsWith(p))
}
