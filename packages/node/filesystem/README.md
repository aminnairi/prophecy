# @prophecy/node/filesystem

## Installation

```bash
npm install @prophecy/node
```

## Usage

### Open file as buffer

```typescript
import { withBufferFromFile } from "@prophecy/node/filesystem";
import { match } from "@prophecy/future";

withBufferFromFile("package.json")
  .on({
    value: packageJsonContent => {
      console.log(`Content from package.json is ${packageJsonContent}.`);
    },
    issue: match({
      ReadFileIssue: issue => {
        console.error(`Issue while opening the file: ${issue.error}.`);
      },
      UnexpectedIssue: issue => {
        console.error(`Unexpected issue: ${issue.error}.`);
      }
    })
  })
```

### Check if a path is accessible

```typescript
import { pathAccessibleForMode, PathAccess } from "@prophecy/node/filesystem";
import { match } from "@prophecy/future";

pathAccessibleForMode(PathAccess.Readable, "package.json")
  .on({
    value: path => {
      console.log(`Path ${path} is accessible in read-mode.`)
    },
    issue: match({
      PathAccessIssue: issue => {
        console.error(`Path access issue: ${issue.message}.`);
      },
      UnexpectedIssue: issue => {
        console.error(`Unexpected issue ${issue.error}.`);
      }
    })
  });
```

### Check if a path is accessible for multiple modes

```typescript
import { pathAccessibleForMode, PathAccess } from "@prophecy/node/filesystem";
import { match } from "@prophecy/future";

pathAccessibleForMode([PathAccess.Readable, PathAccess.Writable], "package.json")
  .on({
    value: path => {
      console.log(`Path ${path} is accessible in read-write-mode.`)
    },
    issue: match({
      PathAccessIssue: issue => {
        console.error(`Path access issue: ${issue.message}.`);
      },
      UnexpectedIssue: issue => {
        console.error(`Unexpected issue ${issue.error}.`);
      }
    })
  });
```

### Write a string to a file

```typescript
import { writeStringToFile } from "@prophecy/node/filesystem";
import { match } from "@prophecy/future";

writeStringToFile("package.json", '{"private": true}')
  .on({
    issue: match({
      UnexpectedIssue: issue => {
        console.error(`Unexpected issue ${issue.error}.`);
      }
    })
  });
```

### Write to a file from a previous result

```typescript
import { writeToFile } from "@prophecy/node/filesystem";
import { Future, match } from "@prophecy/future";

Future
  .from<string>(() => emitValue('{"type": "module"}'));
  .and(writeToFile("package.json"))
  .on({
    value: data => {
      console.log(`Successfully wrote ${data} to package.json.`);
    },
    issue: match({
      UnexpectedIssue: issue => {
        console.error(`Unexpected issue ${issue.error}.`);
      }
    })
  });
```