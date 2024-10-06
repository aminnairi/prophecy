# @prophecy/array

## Installation

```bash
npm install @prophecy/array
```

## Usage

```typescript
import { getArrayItemAt } from "@prophecy/array";
import { Future } from "@prophecy/core";
import { match } from "@prophecy/issue";

Future.from<Array<number>>(emitValue => {
  return emitValue([ 1, 2, 3 ]);
})
.and(getArrayItemAt(4))
.on({
  value: value => {
    console.log(`Value at index 4 is ${value}`)
  },
  issue: match({
    UnexpectedIssue: issue => {
      console.error(`Unexpected issue: ${issue.error}.`)
    },
    IndexNotFoundIssue: issue => {
      console.error(`Value at index ${issue.index} not found.`);
    }
  })
});
```