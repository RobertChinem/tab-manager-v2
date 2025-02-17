import Procedure from '../../../shared/types/procedure'
import InternalProcedures from '../../shared/types/internal-procedures'
import Request from '../../../shared/types/request'
import Context from '../types/context'

export type HandleParams<T> = {
  request: Request<T>
  context: Context
}

export default interface InternalProcedure<T extends keyof InternalProcedures>
  extends Procedure {
  handle(
    params: HandleParams<Parameters<InternalProcedures[T]>[0]>,
  ): ReturnType<InternalProcedures[T]>
}
