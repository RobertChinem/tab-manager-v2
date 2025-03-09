import React from 'react'
import * as UI from '../../../../../shared/types/ui'
import PlatformInput from '../input'

function Text({ text, className }: UI.Text): React.JSX.Element {
  return <p className={className}>{text}</p>
}

function Input({
  onInputChange,
  inputParams: { id, placeholder, className, value },
}: {
  onInputChange: (eventTarget: HTMLInputElement) => void
  inputParams: UI.Input
}): React.JSX.Element {
  return (
    <PlatformInput
      onChange={(e) => onInputChange(e.target)}
      id={id}
      placeholder={placeholder}
      className={className}
      value={value}
    />
  )
}

function Element({
  onInputChange,
  elementParams: { input, text },
}: {
  onInputChange: (eventTarget: HTMLInputElement) => void
  elementParams: UI.Element
}): React.JSX.Element {
  return (
    <>
      {!!input && <Input onInputChange={onInputChange} inputParams={input} />}
      {!!text && <Text {...text} />}
    </>
  )
}

function Section({
  onInputChange,
  sectionParams: { elements },
}: {
  onInputChange: (eventTarget: HTMLInputElement) => void
  sectionParams: UI.Section
}): React.JSX.Element {
  return (
    <div className='flex flex-col gap-2'>
      {elements.map((elementParams, index) => (
        <Element
          key={index}
          onInputChange={onInputChange}
          elementParams={elementParams}
        />
      ))}
    </div>
  )
}

function Page({
  onInputChange,
  pageParams: { sections },
}: {
  onInputChange: (eventTarget: HTMLInputElement) => void
  pageParams: UI.Page
}): React.JSX.Element {
  return (
    <div className='flex flex-col gap-4'>
      {sections.map((sectionParams, index) => (
        <Section
          key={index}
          onInputChange={onInputChange}
          sectionParams={sectionParams}
        />
      ))}
    </div>
  )
}

export { Page, Section, Element, Input, Text }
