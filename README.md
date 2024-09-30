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
| 0 | createTypeToValue with no cache | 1 | 694115616.607666 | ±5.26% | 10 | 
| 1 | createTypeToValue with cache | 2,481,911 | 402.91517262316285 | ±0.25% | 3722869 |

#### convert test

| (index) | Task Name | ops/sec | Average Time (ns) | Margin | Samples |
| :----: | :----: | :----: | :----: | :----: | :----: | 
| 0 | convert with no cache | 1 | 987094781.8934917 | ±4.60% | 10 | 
| 1 | convert with cache | 2,475,805 | 403.9089469976046 | ±0.68% | 3713709 |
| 2 | convert with cache & copy | 504,439 | 1982.3976543052838 | ±0.17% | 756660 |

## TODO

- playground
