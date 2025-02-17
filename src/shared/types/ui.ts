type Input = {
  id: string
  placeholder?: string
  value?: string
  className?: string
}

type Text = {
  text: string
  className?: string
}

type Element = {
  input?: Input
  text?: Text
}

type Section = {
  elements: Element[]
}

type Page = {
  sections: Section[]
  metadata?: {
    pressedKeys?: string[]
  }
}

export { Input, Text, Element, Section, Page }
