import Request from '../../shared/types/request'
import CustomProcedure from '../../shared/types/custom-procedure'
import InternalProcedure from './internal-procedures/internal-procedure'
import * as UI from '../../shared/types/ui'
import Context from './types/context'
import InternalProcedures from '../shared/types/internal-procedures'

export default class ChromeMessageHandler {
  private internalProcedures: Map<
    string,
    InternalProcedure<keyof InternalProcedures>
  > = new Map()

  private customProcedures: Map<string, CustomProcedure> = new Map()

  constructor(params: {
    internalProcedures: InternalProcedure<keyof InternalProcedures>[]
    customProcedures: CustomProcedure[]
  }) {
    const { internalProcedures, customProcedures } = params
    internalProcedures.forEach((p) => this.registerInternalProcedure(p))
    customProcedures.forEach((p) => this.registerCurstomProcedure(p))
  }

  start() {
    chrome.runtime.onMessage.addListener(
      (request: Request<unknown>, _, sendResponse) => {
        if (request.procedure.startsWith('internal.')) {
          const procedure = this.internalProcedures.get(request.procedure)
          if (procedure) {
            procedure
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              .handle({ request: request as any, context: this.getContext() })
              .then((response) => sendResponse(response))
          }
        } else if (request.procedure.startsWith('custom.')) {
          const procedure = this.customProcedures.get(request.procedure)
          if (procedure) {
            procedure
              .handle(request as Request<UI.Page>)
              .then((response) => sendResponse(response))
          }
        }
        return true
      },
    )
  }

  private registerCurstomProcedure(procedure: CustomProcedure) {
    this.customProcedures.set(`custom.${procedure.getName()}`, procedure)
  }

  private registerInternalProcedure(
    procedure: InternalProcedure<keyof InternalProcedures>,
  ) {
    this.internalProcedures.set(`internal.${procedure.getName()}`, procedure)
  }

  private getContext(): Context {
    return {
      customProcedures: this.customProcedures,
    }
  }
}
