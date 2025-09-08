type Input = {
  id: string
  placeholder?: string
  value?: string
  className?: string
}

type Button = {
  id: string
  text: Text
  className?: string
}

type Text = {
  text: string
  className?: string
}

type Element = {
  input?: Input
  button?: Button
  text?: Text
}

type Section = {
  elements: Element[]
  className?: string
}

type Page = {
  sections: Section[]
  metadata?: {
    pressedKeys?: string[],
    clickedId?: string,
  }
}

export { Input, Button, Text, Element, Section, Page }
