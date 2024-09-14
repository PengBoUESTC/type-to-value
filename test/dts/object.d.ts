interface DataObject {
  a: string
  b: number
  c: boolean
  d: undefined
  e: null
}

interface LiteralValue {
  a: '',
  b: 1,
  c: false,
}

interface T {
  a: string
  b: number
  c: boolean
  d: null
}
interface DataObject2 {
  a: Partial<T>
  b?: number
}