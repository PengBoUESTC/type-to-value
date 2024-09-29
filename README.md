# type-to-value

> convert typescript type to javascript value

## How to use

```typescript
import { TypeToValue } from 'type-to-value';

const typeToValue = new TypeToValue({
  sourceFilePath: 'src/**/*.ts', // your project path 
  // tsConfigFilePath: 'xxx'  // tsconfig path
});

// call run to get the convert path, 
/**
 * @param, type file path 
 * @param, type to convert
 * @param, default value to rewrite
 */
const result = typeToValue.run('src/types/YourType.ts', 'YourType');
```

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

## TODO

- playground
