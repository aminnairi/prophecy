# @prophecy/node/readline

## Installation

```bash
npm install @prophecy/node
```

## Usage

### Ask a question

```typescript
import { question } from "@prophecy/node/readline";
import { match } from "@prophecy/future";

question({ message: "What is your name?" })
  .on({
    value: name => {
      console.log(`Nice to meet you, ${name}.`)
    },
    issue: match({
      ReadlineIssue: issue => {
        console.error(`Readline error: ${issue.error}`);
      },
      UnexpectedIssue: issue => {
        console.error(`Unexpected issue: ${issue.error}`);
      }
    })
  });
```