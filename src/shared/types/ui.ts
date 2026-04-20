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

type Button = {
  id: string
  text: Text
  className?: string
}

type Element = {
  input?: Input
  text?: Text
  button?: Button
}

type Section = {
  elements: Element[]
  className?: string
}

type Page = {
  sections: Section[]
  metadata?: {
    pressedKeys?: string[]
    clickedId?: string
  }
}

export { Input, Text, Button, Element, Section, Page }
