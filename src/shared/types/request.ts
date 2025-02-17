type Request<T> = {
  procedure: string
  source?: string
  data?: T
}

export default Request
