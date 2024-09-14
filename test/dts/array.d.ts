interface ArrayData {
  a: Array<{a : string}>
}

// @ts-expect-error test for genOuterObject
type ArrayData2 = Array<Arr>
type ArrayData3 = {
  a: [string, number, boolean]
}
