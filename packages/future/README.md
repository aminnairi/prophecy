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
import { Future } from "@prophecy/future";

Future.from<number>(emitValue => {
  return emitValue(0);
});
```

#### Create a future with an expected issue

A future is a safe place for computations. Since everything can throw at you in JavaScript, using this allows you to safely containerize the exceptions thrown, without losing their context.

```typescript
import { Future, DiscriminatedIssue, kind  } from "@prophecy/future";

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
import { Future } from "@prophecy/future";

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
import { Future, DiscriminatedIssue, match, kind  } from "@prophecy/future";

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
import { Future, DiscriminatedIssue, match, kind  } from "@prophecy/future";

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
import { Future, DiscriminatedIssue, match, kind  } from "@prophecy/future";

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
import { Future, DiscriminatedIssue, kind, match  } from "@prophecy/future";

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
import { Future, DiscriminatedIssue, kind, match  } from "@prophecy/future";

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
import { Future, match  } from "@prophecy/future";

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

## API

### OnIssue

The function that allows you to emit issues over time when needed.

```typescript
type OnIssue<Issue> = (issue: Issue) => null;
```

### OnValue

The function that allows you to emit values over time when needed.

```typescript
type OnValue<Value> = (value: Value) => null;
```

### Start

A function that is always available to you when calling the `Future.from` method that allows you to either emit a successful value, or to emit an error. These functions can be called multiple times and asynchronously since a `Future` is an infinite data structure that has no end.

```typescript
type Start<Value, Issue> = (emitValue: OnValue<Value>, emitIssue: OnIssue<Issue>) => null;
```

### Update

A function that should be provided when calling the `Future.and` method. It allows you to return a new `Future`, and receiving the value of the previous `Future` that has emitted a value.

```typescript
type Update<Value, NewValue, NewIssue extends DiscriminatedIssue> = (value: Value) => Future<NewValue, NewIssue>;
```

### kind

A symbol that helps discriminate errors later when using the `Future.on` method for instance.

```typescript
export const kind = Symbol("DiscriminatedIssueKind");
```

### DiscriminatedIssue

An interface that allow you to create issues that can be discriminated later using the `match` function for instance, or other libraries.

```typescript
export interface DiscriminatedIssue {
  [kind]: string;
}
```

### UnexpectedIssue

An error that is returned whenever one of the below methods like `Future.from` catches an error.

```typescript
export class UnexpectedIssue implements DiscriminatedIssue {
  public readonly [kind] = "UnexpectedIssue";

  public constructor(public readonly error: Error) { }
}
```

### match

A function that will exhaustively match over a `DiscriminatedIssue` instance. It allows you to match against those errors, and to execute a side-effect in case of an error. Since the context of this error is also available, you can surgically create discriminated side-effects against those errors.

```typescript
match<Issue extends DiscriminatedIssue>(patterns: { [Key in Issue[typeof kind]]: (issue: Extract<Issue, { [kind]: Key; }>) => unknown; })
```

### Future.from

Allow you to create a value that can emit value in the future, or that can fail. If the computation might throw an error, it is catched and returned as an `UnexpectedIssue`. Since we cannot say for sure what function does return an error and what function does not with certainty in JavaScript, every computation run in the `Future.from`, `Future.fromValue` and `Future.fromIssue` will return an `UnexpectedIssue`.

```typescript
from<Value = never, Issue extends DiscriminatedIssue = UnexpectedIssue>(start: Start<Value, Issue>): Future<Value, Issue | UnexpectedIssue>
```

### Future.fromValue

A helper method that allow you to send a scalar value. Since this should not fail, only a certain set of types are allowed. If you want something more complex, use the `Future.from` method.

```typescript
fromValue<Value extends ScalarValue>(value: Value): Future<Value>
```

### Future.fromIssue

A helper method that allow you to send an issue. This issue should be an instance of the `DiscriminatedIssue` in order to be able to send it over the stream of data.

```typescript
fromIssue<GenericIssue extends DiscriminatedIssue>(issue: GenericIssue): Future<never, GenericIssue>
```

### Future.and

A helpful method to allow you to compute the next value for a given `Future`, from the previous value emitted of the chained `Future`.

```typescript
and<NewValue, NewIssue extends DiscriminatedIssue>(update: Update<Value, NewValue, NewIssue>): Future<NewValue, Issue | NewIssue | UnexpectedIssue>
```

### Future.recover

A method that will allow you to recover from an issue, meaning that you can provide an alternative computation when encountering an issue. This will in fact allow you to remove that issue from the list of issues emitted when calling the `Future.on` method.

This method accept a new `Future`. Its value and issue types will be added to the sum of all the types that you'll get when calling the `Future.on` method.

```typescript
recover<IssueKind extends Issue[typeof kind], RecoveredIssue extends Extract<Issue, { [kind]: IssueKind }>, IssueWithoutExcludedIssue extends Exclude<Issue, RecoveredIssue>, NewValue, NewIssue extends DiscriminatedIssue>(issue: IssueKind, remediation: (issue: RecoveredIssue) => Future<NewValue, NewIssue>): Future<Value | NewValue, IssueWithoutExcludedIssue | NewIssue>
```

### Future.parallel

A method that allow you to trigger a side-effect, in parallel of the computation of the chained `Future` at that given point in time.

```typescript
parallel(fork: Fork<Value>): Future<Value, Issue | UnexpectedIssue>
```

### Future.on

A method that allow you to take a decision based on the `Future` resolution, whether it is a value or an issue that has been emitted. You don't have to handle the case when a value has been emitted, hence being able to ignore the value, but you can't ignore the issues. This method is very important because it is the one that will start the entire chain of `Future` that has been constructed, this means that if you don't call this method, nothing will be done internally, until you call this method, forcing you to handle every case before triggering anything.

```typescript
on(options: { issue: OnIssue<Issue>, value?: OnValue<Value> }): null
```