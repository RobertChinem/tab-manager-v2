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

function compareObjects(obj1: object, obj2: object): boolean {
  const helper = (obj1: object, obj2: object): boolean => {
    if (Object.keys(obj1).length !== Object.keys(obj2).length) {
      return false
    }

    for (const key in obj1) {
      if (
        typeof obj1[key as keyof typeof obj1] === 'object' &&
        typeof obj2[key as keyof typeof obj2] === 'object'
      ) {
        if (
          !helper(
            obj1[key as keyof typeof obj1],
            obj2[key as keyof typeof obj2],
          )
        ) {
          return false
        }
      } else if (
        obj1[key as keyof typeof obj1] !== obj2[key as keyof typeof obj2]
      ) {
        return false
      }
    }

    return true
  }

  return helper(
    JSON.parse(JSON.stringify(obj1)),
    JSON.parse(JSON.stringify(obj2)),
  )
}

export { getDomainFromURL, getInput, compareObjects }
