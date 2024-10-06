# @prophecy/core

Data structure for safe asynchronous operations and robust error management.

## Features

- **Asynchronous Data Handling:** Manage multiple asynchronous data flows in a type-safe way.
- **Error Handling:** Containerize and handle exceptions gracefully, preserving error context.
- **Future API:** Create and manipulate Future objects that emit values immediately or over time.
- **Multiple Value Emissions:** Emit values multiple times using timed events.
- **Exhaustive Error Handling:** Use the match function to enforce comprehensive error handling.
- **Chaining Computations:** Chain computations safely, ensuring no errors are left unhandled in the process.
- **Error Recovery:** Recover from specific errors using recover and specify alternative computations.
- **Type-safe Operations:** Define and handle custom errors with type discrimination, providing fine-grained error management in asynchronous workflows.
- **Flexible Listeners:** Set up listeners to respond to emitted values or errors, ensuring appropriate action is taken as soon as data or issues are available.

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

You can chain multiple computation on the arrival of one value, and it expect a `Future` in order to keep the chain safe from unhandled errors.

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

You can recover from an issue, meaning handle the issue earlier that expected. By doing so, you can return a new computation as a `Future`. Any new errors will be added in the sum of the errors to handle later, and the type of the value emitted will also be to the sum of the possible value types.

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

## Real-world examples

### Request data from a server

```typescript
import { Future } from "@prophecy/core";
import { DiscriminatedIssue, kind, match } from "@prophecy/issue";

interface User {
  id: number,
  username: string,
  email: string
}

class BadStatusIssue implements DiscriminatedIssue {
  public readonly [kind] = "BadStatusIssue";
  public constructor(public readonly statusCode: number) {}
}

class EmptyUsersIssue implements DiscriminatedIssue {
  public readonly [kind] = "EmptyUsersIssue";
}

const getUsers = () => {
  return Future.from<Array<User>, BadStatusIssue | EmptyUsersIssue>((emitValue, emitIssue) => {
    fetch("https://jsonplaceholder.typicode.com/users").then(response => {
      if (!response.ok) {
        return emitIssue(new BadStatusIssue(response.status));
      }

      return response.json();
    }).then(users => {
      if (users.length === 0) {
        return emitIssue(new EmptyUsersIssue);
      }

      return emitValue(users);
    });
  });
}

getUsers().on({
  value: users => {
    users.forEach(({ id, username, email }) => {
      console.log(`User#${id}: ${username} <${email}>`);
    });
  },
  issue: match({
    BadStatusIssue: issue => {
      console.error(`Failed to get a good response, received status ${issue.statusCode}.`);
    },
    EmptyUsersIssue: () => {
      console.error(`Failed to get at least one user.`);
    },
    UnexpectedIssue: issue => {
      console.error(`Unexpected issue: ${issue.error}.`);
    }
  })
});
```

### Manipulate the Document Object Model

```typescript
import { Future } from "@prophecy/core";
import { DiscriminatedIssue, kind, match } from "@prophecy/issue";

class ElementNotFoundIssue implements Discriminatedissue {
  public readonly [kind] = "ElementNotFoundIssue";
  public constructor(public readonly id: string) {}
}

const getElementBydId = (parent: Element, id: string) => {
  return Future.from<HTMLElement, ElementNotFoundIssue>((emitValue, emitIssue) => {
    const element = parent.getElementById(id);

    if (!element) {
      return emitIssue(new ElementNotFoundIssue(id));
    }

    return emitValue(element);
  });
}

getElementById(document, "input").on({
  value: inputElement => {
    console.log(`Value is ${inputElement.target.value}`);
  },
  issue: match({
    ElementNotFoundIssue: issue => {
      console.error(`Element with id ${issue.id} is not found.`)
    },
    UnexpectedIssue: issue => {
      console.error(`Unexpected error: ${issue.error}.`)
    }
  })
});
```

### Ignore the value, handle errors only

```typescript
import { Future } from "@prophecy/core";
import { match } from "@prophecy/issue";

Future.from<number>(emitValue => {
  return emitValue(123);
}).on({
  issue: match({
    UnexpectedIssue: issue => {
      console.error(`Unexpected issue: ${issue.error}`)
    }
  })
});
```

## Uninstallation

```bash
npm uninstall @prophecy/core
```