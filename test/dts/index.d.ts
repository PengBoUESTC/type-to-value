interface Data {
  a: string
  b: number
  // @ts-expect-error test for genOuterObject => return {}
  c: EmptyInterface 
}