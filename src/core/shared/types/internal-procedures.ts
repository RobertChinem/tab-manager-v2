export default interface InternalProcedures {
  getProcedures(): Promise<{ procedure: string; description: string }[]>
}
