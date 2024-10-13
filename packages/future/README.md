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

## Prior art

### RxJS

RxJS is a library that allow you to create observable data structures to make composition of behavior easier by creating a stream of data.

It is heavily used by manu other libraries and frameworks, like Angular for instance.

However, one thing missing from this library that is important when building robust software is the ability to precisely type the errors, which falls into the pit of the `Error` class that can be them discriminated using an `instanceof` keyword, except few people do this, since this is too much work, and the library as well as the language (JavaScript/TypeScript) does not provide enough help to make this easier.

RxJS is probably the closest library in design from `@prophecy/future` since they both operate on inifinite and asynchronous data structures, but have the difference that this library has solutions for indicating clearly what errors can be expected from a `Future`, instead of having just a `Observable<Users>`, we can have a `Future<Users, UsersNotFoundIssue | UsersEmptyIssue>` in here.

### Effect.ts

Effect.ts is an interesting library that aims at doing so much more than just having a data structure for encoding values and errors.

This is also a close solution from `@prophecy/future` because it has the ability to create data structures that can be asynchronous and infinite, and leverages tools from the language such as Promises or even Asynchronous Generators.

This could in theory be a perfect replacement for this library, except it is doing so much more things under the hood, and might not be a perfect fit for teams that are in search of a replacement for observables, asynchronous generators or promises since Effect.ts is also a complete environment for things like batching, caching, concurrency, streaming and much more.

Instead, `@prophecy/future` is a much more condensed set of tools that are only used to solve a specific problem: working with asynchronous and infinite data structures and composing in an easy and safe manner.

### Elm

Yes, Elm is not a direct JavaScript nor TypeScript library, but this one is rather an entirely new language which is a functional language.

This library has first been inspired by Elm, and Haskell also, which has interesting ways of making your code more robust and type-safe in a pure and functional way.

Things like Maybe or Result to encode a computation that can return a value or an error, which are really clever ways of explicitely dealing with potential errors, but also, the interesting one, the Task type, which is the equivalent of an `Effect`, or a `Future`.

Elm has the advantage to have built-in tools in its language to easily work with those kind of data structure like pattern matching, and algebraic data types (ADT). Things like that are really missing in TypeScript when you want to have a more robust language, but due to the sheer nature of the JavaScript language, it seems like it will never be one day the case.

However, one downside of Elm is that is has a limited scope for working with the JavaScript language, which you reach pretty soon when working with complex applications that needs more from the language, things like working with Web APIs that may not be directly supported for instance.

For that, solutions exists that let you use the JavaScript language in order to work with the Elm runtime by using ports, which are in my opinion, the most well-tought and type-safe way of working with FFI (Foreign-Function Interfaces). Unfortunately, the problem is in its solution: you use the JavaScript language, an impure language where everything can be thrown at you for no apparent or documented reason, and that alone is a big downside when it comes to getting out and touching some Web APIs grass.

In the contrary, `@prophecy/future` aims at giving you the tools right beside the language itself, in order to perform actions in a safer way. It also help you reduce the amount of language needed to be used (Elm + JavaScript) in order to do most of the things that are interesting to use for a Web Application like vibrating a device, registrating the geolocation, using SSE servers, saving to the clipboard, etc...