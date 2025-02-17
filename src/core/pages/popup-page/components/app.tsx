import React, { useEffect, useMemo, useState } from 'react'
import Gateway from '../../shared/gateway'
import Input from '../../shared/components/input'
import * as UI from '../../../../shared/types/ui'
import * as BaseUI from '../../shared/components/base-ui'
import * as Utils from '../../../../shared/utils'

const App = () => {
  const [search, setSearch] = useState('')
  const [procedures, setProcedures] = useState<
    { procedure: string; description: string }[]
  >([])
  const [page, setPage] = useState<UI.Page>({ sections: [] })
  const filteredProcedures = useMemo(() => {
    if (!search || search.length === 0) return procedures
    const words = search.split(' ').filter((word) => word.length > 0)
    return procedures.filter((command) => {
      return words.every((word) => {
        return command.description.toLowerCase().includes(word.toLowerCase())
      })
    })
  }, [procedures, search])
  const selectedProcedure =
    search.length > 0 && filteredProcedures.length > 0
      ? filteredProcedures[0]
      : null

  const handleInputChange = (inputEl: HTMLInputElement) => {
    if (!selectedProcedure) {
      return
    }

    const input = Utils.getInput(inputEl.id || '', page)
    if (input) {
      input.value = (inputEl.value as string) || ''
      new Gateway()
        .executeCustomProcedure({
          procedure: selectedProcedure.procedure,
          source: 'popup-page',
          data: page,
        })
        .then(setPage)
    }
  }

  const handleKeyUp = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!selectedProcedure) {
      return
    }

    if (event.key === 'Enter') {
      new Gateway()
        .executeCustomProcedure({
          procedure: selectedProcedure.procedure,
          source: 'popup-page',
          data: {
            ...page,
            metadata: {
              pressedKeys: [event.key],
            },
          },
        })
        .then(() => window.close())
    }
  }

  useEffect(() => {
    if (search.length > 0 && !!selectedProcedure) {
      new Gateway()
        .executeCustomProcedure({
          procedure: selectedProcedure.procedure,
          source: 'popup-page',
          data: page,
        })
        .then(setPage)
    } else {
      setPage({ sections: [] })
    }
  }, [page, search, selectedProcedure])

  useEffect(() => {
    if (procedures.length === 0) {
      new Gateway()
        .getProcedures()
        .then((procedures) =>
          procedures.sort((a, b) =>
            a.description
              .toLowerCase()
              .localeCompare(b.description.toLocaleLowerCase()),
          ),
        )
        .then(setProcedures)
    }
  }, [procedures.length])

  return (
    <div
      className='w-96 p-4 flex flex-col gap-4 bg-zinc-100'
      onKeyUp={handleKeyUp}
    >
      <Input
        placeholder='Enter a command'
        autoFocus={true}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div>
        {filteredProcedures.map((procedure, index) => (
          <p
            key={procedure.procedure}
            className={index === 0 ? 'font-bold text-sm' : 'font-light text-xs'}
          >
            {procedure.description}
          </p>
        ))}
      </div>
      {!!selectedProcedure && (
        <div className='flex flex-col gap-4 bg-red-500 p-2 rounded-lg bg-white'>
          <div>
            <h1 className='text-lg font-semibold'>
              {selectedProcedure.description}
            </h1>
          </div>
          <div>
            <BaseUI.Page onInputChange={handleInputChange} pageParams={page} />
          </div>
        </div>
      )}
    </div>
  )
}

export default App
