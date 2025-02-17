import * as UI from './types/ui'

function getDomainFromURL(url: string): string {
  const parsedUrl = new URL(url)
  let domain = parsedUrl.hostname

  if (domain.startsWith('www.')) {
    domain = domain.slice(4)
  }

  return domain
}

function getInput(id: string, { sections }: UI.Page): UI.Input | null {
  for (const { elements } of sections) {
    for (const element of elements) {
      if (!!element.input && element.input.id === id) {
        return element.input
      }
    }
  }
  return null
}

export { getDomainFromURL, getInput }
