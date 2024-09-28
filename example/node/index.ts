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