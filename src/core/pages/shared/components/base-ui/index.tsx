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

function Button({
  onClick,
  buttonParams
}: {
  onClick: (id: string) => void
  buttonParams: UI.Button
}): React.JSX.Element {
  return (
    <button
      onClick={() => onClick(buttonParams.id)}
      className={buttonParams.className}>
      <Text {...buttonParams.text} />
    </button>
  )
}

function Element({
  onClick,
  onInputChange,
  elementParams: { input, button, text },
}: {
  onClick: (id: string) => void
  onInputChange: (eventTarget: HTMLInputElement) => void
  elementParams: UI.Element
}): React.JSX.Element {
  return (
    <>
      {!!input && <Input onInputChange={onInputChange} inputParams={input} />}
      {!!text && <Text {...text} />}
      {!!button && <Button onClick={onClick} buttonParams={button} />}
    </>
  )
}

function Section({
  onClick,
  onInputChange,
  sectionParams: { elements, className },
}: {
  onClick: (id: string) => void
  onInputChange: (eventTarget: HTMLInputElement) => void
  sectionParams: UI.Section
}): React.JSX.Element {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {elements.map((elementParams, index) => (
        <Element
          key={index}
          onClick={onClick}
          onInputChange={onInputChange}
          elementParams={elementParams}
        />
      ))}
    </div>
  )
}

function Page({
  onClick,
  onInputChange,
  pageParams: { sections },
}: {
  onClick: (id: string) => void
  onInputChange: (eventTarget: HTMLInputElement) => void
  pageParams: UI.Page
}): React.JSX.Element {
  return (
    <div className='flex flex-col gap-4'>
      {sections.map((sectionParams, index) => (
        <Section
          key={index}
          onClick={onClick}
          onInputChange={onInputChange}
          sectionParams={sectionParams}
        />
      ))}
    </div>
  )
}

export { Page, Section, Element, Input, Text }
