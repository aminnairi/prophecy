# @prophecy/core

Shape your future, leave uncertainty behind

```typescript
import { match } from "@prophecy/issue";
import { writeToPath } from "@prophecy/node/filesystem";
import { abortAt, sendRequestAtUrl, withAbortController } from "@prophecy/http";
import { Users, toJson, toStringifiedJson, toUsers } from "./schemas/users";
import { Future } from "@prophecy/core";

withAbortController()
  .and(abortAt({ seconds: 5 }))
  .and(({ abortController: { signal }, stopTimeout }) => {
    return sendRequestAtUrl("https://jsonplaceholder.typicode.com/users", { signal })
      .and(stopTimeout);
  })
  .and(toJson)
  .and(toUsers)
  .recover("UserValidationIssue", () => new Future<Users, never>(onValue => onValue([])))
  .and(toStringifiedJson({ pretty: true }))
  .and(writeToPath("users.json"))
  .run({
    onIssue: match({
      UnexpectedIssue: () => console.error("Failed to instantiate an abort controller"),
      BadResponseIssue: () => console.error("Bad response from the server."),
      RequestCanceledIssue: () => console.error("Request canceled, nothing to do."),
      JsonParseIssue: () => console.error("Failed to parse the users from the response."),
    })
  });
```

## Why

Objects are single values, they don't scale well.

Arrays are multiple values, they scale well, but are limited in time since they can't be asynchronous.

Promises are asynchronous, but they only emit one time, making them short lived.

Generators can emit multiple times, but lack a way of declaring explicitely their errors, plus errors can be thrown at you, even if they are not well documented.

Hence why this library has been created: provide a data structure that would allow to handle values that can span over time, with a strong emphasis on declaring what the possible errors could be, in order to be able to exhaustively handle them all.

## Target

This library is aimed at anyone having some understanding of the main principles of functional programming since it has been designed with functional programming in mind.

And above all, this library is aimed at anyone wanting some sleep in the night, knowing they have successfully transpiled their code without errors, and so without any case left out since this library has a strong policy over errors since you have to handle them all.

This library is not for those wanting a fast alternative to RxJS of Effect, nor those who don't value the importance of error handling in their code, those that might rather code only on the happy path, and not see the dark path.

## Examples

### Web

See [`example/web`](./example/web)

### Node

See [`example/node`](./example/node)

## What's left to do?

- See if using an interface (`FutureInterface`) with two classes (`Succees`, `Failure`) with a union type (`type Future<Value, Issue> = Success<Value> | Failure<Issue>`) might play nicely and better than the current implementation
- Add more packages and packages' functions
- Document the whole API once it gets out of the real-world testing phase
- Add support for command line interface using `readline`
- Add support for log messages using the Syslog format
- Compare this library with RxJS and credit them
- Compare this library with Effect and credit them
- Find a cool logo
- Add some unit testing and try to reach 100% code coverage
- Create a documentation website
- Publish all packages
- Add a lot of documentation & comments in the source code (like a sea of comment, mediterranean sea level)
- Add support for the Bluetooth Web API
- Add support for the USB Web API
- Add support for the Battery Web API
- Add support for the Background Sync Web API
- Add support for the Beacon Web API
- Add support for the Resize Observer Web API
- Add support for the Intersection Observer Web API
- Add support for the Mutation Observer Web API
- Add support for the Proximity Sensor Web API
- Add support for the Ambiant Light Sensor Web API
- Add support for the Magnetometer Web API
- Add support for the Gyroscope/Accelerometer Web API
- Add support for the Clipboard Web API
- Add support for the Screen Orientation Web API
- Add support for the Session Storage Web API
- Add support for the NFC Web API
- Add support for the Operating System Node.js API
- Add support for the DNS Node.js API