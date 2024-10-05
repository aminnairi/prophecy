# @prophecy/core

## Requirements

- [Node.js](https://nodejs.org/)
- [NPM](https://docs.npmjs.com/)

## Installation

```bash
npm install @prophecy/core
```

## Usage

### Future

You can use a future to send a value that will immediately return a value.

```typescript
import { Future } from "@prophecy/core";

Future.from<number>(emitValue => {
  return emitValue(0);
});
```

#### Create a future with an expected issue

A future is a safe place for computations. Since everything can throw at you in JavaScript, using this allows you to safely containerize the exceptions thrown, without losing their context.

```typescript
import { DiscriminatedIssue, kind } from "@prophecy/issue";
import { Future } from "@prophecy/core";

class RandomIssue implements DiscriminatedIssue {
  public readonly [kind] = "RandomIssue";
}

Future.from<number, RandomIssue>((emitValue, emitIssue) => {
  if (Math.random() > 0.5) {
    return emitIssue(new RandomIssue);
  }

  return emitValue(0);
});
```

#### Emit multiple values over time

You can also use a future to send a value that will return a value later, or many times if needed.

```typescript
import { Future } from "@prophecy/core";

Future.from<number>(emitValue => {
  setTimeout(() => {
    emitValue(0);
    setTimeout(() => {
      emitValue(1);
      setTimeout(() => {
        emitValue(2);
      }, 1000);
    }, 1000);
  }, 1000);

  return null;
});
```

#### Do something when one value arrives

You can listen for when a value arrives, by doing so, you are also force to handle the case where an issue occurs at the same time, preventing omiting to handle an error. Use the `match` function to handle all possible errors in an exhaustive way.

```typescript
import { DiscriminatedIssue, match, kind } from "@prophecy/issue";
import { Future } from "@prophecy/core";

class RandomIssue implements DiscriminatedIssue {
  public readonly [kind] = "RandomIssue";
}

const future = Future.from<number, RandomIssue>((emitValue, emitIssue) => {
  if (Math.random() > 0.5) {
    return emitIssue(new RandomIssue);
  }

  return emitValue(0);
});

future.on({
  value: value => {
    console.log(`Value is ${value}`);
    return null;
  },
  issue: match({
    UnexpectedIssue: issue => {
      console.error(`An unexpected issue occured: ${issue.error}`);
    },
    RandomIssue: () => {
      console.error("Unlucky...");
    }
  });
});
```

#### Do something else when one value arrives

```typescript
import { DiscriminatedIssue, match, kind } from "@prophecy/issue";
import { Future } from "@prophecy/core";

class RandomIssue implements DiscriminatedIssue {
  public readonly [kind] = "RandomIssue";
}

class DivisionByZeroIssue implements DiscriminatedIssue {
  public readonly [kind] = "DivisionByZeroIssue";
}

const future = Future.from<number, RandomIssue>((emitValue, emitIssue) => {
  if (Math.random() > 0.5) {
    return emitIssue(new RandomIssue);
  }

  return emitValue(0);
});

const futureWithDivision = future.and(value => {
  return Future.from<number, DivisionByZeroIssue>((emitValue, emitIssue) => {
    if (value === 0) {
      return emitIssue(new DivisionByZeroIssue);
    }

    return emitValue(2 / value);
  });
});

futureWithDivision.on({
  value: value => {
    console.log(`Value is ${value}`);
    return null;
  },
  issue: match({
    UnexpectedIssue: issue => {
      console.error(`An unexpected issue occured: ${issue.error}`);
    },
    RandomIssue: () => {
      console.error("Unlucky...");
    },
    DivisionByZeroIssue: () => {
      console.error("Division by zero are not acceptable.");
    }
  });
});
```

#### Attempt to recover from an issue

```typescript
import { DiscriminatedIssue, match, kind } from "@prophecy/issue";
import { Future } from "@prophecy/core";

class RandomIssue implements DiscriminatedIssue {
  public readonly [kind] = "RandomIssue";
}

class TimeIssue implements DiscriminatedIssue {
  public readonly [kind] = "TimeIssue";
}

const future = Future.from<number, RandomIssue>((emitValue, emitIssue) => {
  if (Math.random() > 0.5) {
    return emitIssue(new RandomIssue);
  }

  return emitValue(0);
});

const futureWithRecovery = future.recover({
  issue: "RandomIssue",
  remediation: () => {
    return Future.from<number, TimeIssue>((emitValue, emitIssue) => {
      if (new Date().getTime() % 2 === 0) {
        return emitIssue(new TimeIssue);
      }

      return emitValue(Infinity);
    });
  }
});

futureWithRecovery.on({
  value: value => {
    console.log(`Value is ${value}`);
    return null;
  },
  issue: match({
    TimeIssue: () => {
      console.error("Time error...");
    },
    UnexpectedIssue: issue => {
      console.error(`An unexpected issue occured: ${issue.error}`);
    }
  });
});
```

## Uninstallation

```bash
npm uninstall @prophecy/core
```