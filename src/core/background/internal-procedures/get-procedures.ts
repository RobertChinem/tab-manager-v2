import InternalProcedure, { HandleParams } from './internal-procedure'

export default class GetProcedures
  implements InternalProcedure<'getProcedures'>
{
  getName(): string {
    return 'getProcedures'
  }

  async handle({
    context,
  }: HandleParams<unknown>): Promise<
    { procedure: string; description: string }[]
  > {
    const { customProcedures } = context

    return Array.from(customProcedures.values()).map((p) => ({
      procedure: p.getName(),
      description: p.getDescription(),
    }))
  }
}
