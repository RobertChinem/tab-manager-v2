import React from 'react'
import * as UI from '../../../../../shared/types/ui'
import PlatformInput from '../input'

type Handlers = {
  onInputChange: (eventTarget: HTMLInputElement) => void
  onClick: (id: string) => void
}

function Text({ text, className }: UI.Text): React.JSX.Element {
  return <p className={className}>{text}</p>
}

function Input({
  onInputChange,
  inputParams: { id, placeholder, className, value },
}: {
  onInputChange: Handlers['onInputChange']
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
  buttonParams: { id, text, className },
}: {
  onClick: Handlers['onClick']
  buttonParams: UI.Button
}): React.JSX.Element {
  return (
    <button type='button' onClick={() => onClick(id)} className={className}>
      <Text {...text} />
    </button>
  )
}

function Element({
  handlers,
  elementParams: { input, text, button },
}: {
  handlers: Handlers
  elementParams: UI.Element
}): React.JSX.Element {
  return (
    <>
      {!!input && (
        <Input onInputChange={handlers.onInputChange} inputParams={input} />
      )}
      {!!text && <Text {...text} />}
      {!!button && <Button onClick={handlers.onClick} buttonParams={button} />}
    </>
  )
}

function Section({
  handlers,
  sectionParams: { elements, className },
}: {
  handlers: Handlers
  sectionParams: UI.Section
}): React.JSX.Element {
  return (
    <div
      className={
        className ? `flex flex-col gap-2 ${className}` : 'flex flex-col gap-2'
      }
    >
      {elements.map((elementParams, index) => (
        <Element
          key={index}
          handlers={handlers}
          elementParams={elementParams}
        />
      ))}
    </div>
  )
}

function Page({
  onInputChange,
  onClick,
  pageParams: { sections },
}: {
  onInputChange: Handlers['onInputChange']
  onClick: Handlers['onClick']
  pageParams: UI.Page
}): React.JSX.Element {
  const handlers: Handlers = { onInputChange, onClick }
  return (
    <div className='flex flex-col gap-4'>
      {sections.map((sectionParams, index) => (
        <Section
          key={index}
          handlers={handlers}
          sectionParams={sectionParams}
        />
      ))}
    </div>
  )
}

export { Page, Section, Element, Input, Text, Button }
