interface ArrayData {
  a: Array<{a : string}>
}

type ArrayData2 = Array<Arr>
type ArrayData3 = {
  a: [string, number, boolean]
}
