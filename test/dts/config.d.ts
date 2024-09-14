interface ConfigObject {
  a: {
    d: {
      e: boolean
    }
  }
  b: {
    c: number
  },
  // @ts-expect-error test for outerObject
  z: ExternalType
}
