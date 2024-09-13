export const enum T {
  a = 100,
  b = 300
}

export interface DataEnum {
  // test for isEnum
  a: T
  b: T.b
}
export interface DataEnum2 {
  // @ts-expect-error test for genOuterObject => genEnum
  a: F
  // @ts-expect-error
  b: F.b
  // @ts-expect-error
  c: D
}
