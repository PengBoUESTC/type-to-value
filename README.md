# type-to-value

> convert typescript type to javascript value

## How to use

```typescript
import { TypeToValue } from 'type-to-value';

const typeToValue = new TypeToValue({
  cache: true, // cache parse result
  sourceFilePath: 'src/**/*.ts', // your project path 
  // tsConfigFilePath: 'xxx'  // tsconfig path
});

// call run to get the convert path, 
/**
 * @param, type file path 
 * @param, type to convert
 * @param, default value to rewrite
 */
const result1 = typeToValue.run('src/types/YourType.ts', 'YourType');
const result2 = typeToValue.runWithCache('src/types/YourType.ts', 'YourType');
const result3 = typeToValue.runWithCopy('src/types/YourType.ts', 'YourType');
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

## bench test 

#### TypeToValue test

| (index) | Task Name | ops/sec | Average Time (ns) | Margin | Samples |
| :----: | :----: | :----: | :----: | :----: | :----: | 
| 0 | createTypeToValue with no cache | 1 | 759875298.4046936 | ±8.95% | 10 | 
| 1 | createTypeToValue with cache | 2,732,229 | 366.00140104860225 | ±0.22% | 1366115 |

#### convert test

| (index) | Task Name | ops/sec | Average Time (ns) | Margin | Samples |
| :----: | :----: | :----: | :----: | :----: | :----: | 
| 0 | convert with no cache | 1 | 961704700.1957893 | ±3.87% | 10 | 
| 1 | convert with cache | 2,385,505 | 419.19844706993086 | ±1.90% | 1192753 |
| 2 | convert with cache & copy | 500,484 | 1998.0653901491796 | ±0.59% | 250243 |

## TODO

- playground
