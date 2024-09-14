interface UnionData {
  a: '1' | '2'
}

interface UnionType1 {
  a: string
}
interface UnionType2 {
  b: number
}
interface UnionData2 {
  c: { b: boolean } | UnionType1 | UnionType2
}
