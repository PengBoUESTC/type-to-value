# type-to-value

> convert typescript type to value

```typescript
// before
interface Data {
  a: string
  b: number
}

// after
{
  "a": "string",
  "b": 0,
}
```