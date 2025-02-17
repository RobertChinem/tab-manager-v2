import InternalProcedures from '../../shared/types/internal-procedures'
import Request from '../../../shared/types/request'
import * as UI from '../../../shared/types/ui'

export default class Gateway implements InternalProcedures {
  async getProcedures(): Promise<{ procedure: string; description: string }[]> {
    return this.execute<{ procedure: string; description: string }[]>({
      procedure: 'internal.getProcedures',
    })
  }

  async executeCustomProcedure({
    procedure,
    ...rest
  }: Request<UI.Page>): Promise<UI.Page> {
    return this.execute({ procedure: `custom.${procedure}`, ...rest })
  }

  execute<T>(request: Request<unknown>): Promise<T> {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(request, (response) => {
        resolve(response)
      })
    })
  }
}
