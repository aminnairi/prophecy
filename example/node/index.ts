import { match } from "@prophecy/issue";
import { writeToPath } from "@prophecy/node/filesystem";
import { abortAt, createAbortController, sendAbortableRequest } from "@prophecy/http";
import { Users, toJson, toStringifiedJson, toUsers } from "./schemas/users";
import { Future } from "@prophecy/core";

createAbortController()
  .and(abortAt({ seconds: 5 }))
  .and(sendAbortableRequest("https://jsonplaceholder.typicode.com/users"))
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