import { Future, match } from "@prophecy/future";
import { writeToFile } from "@prophecy/node/filesystem";
import { abortAt, createAbortController, sendAbortableRequest } from "@prophecy/http";
import { Users, toJson, toStringifiedJson, toUsers } from "./schemas/users";

createAbortController()
  .and(abortAt({ seconds: 5 }))
  .and(sendAbortableRequest({ url: "https://jsonplaceholder.typicode.com/users" }))
  .and(toJson)
  .and(toUsers)
  .recover("UserValidationIssue", () => Future.of<Users>((onValue) => onValue([])))
  .and(toStringifiedJson({ pretty: true }))
  .and(writeToFile({ path: "users.json" }))
  .run(match({
    UnexpectedIssue: () => console.error("Failed to instantiate an abort controller"),
    BadResponseIssue: () => console.error("Bad response from the server."),
    RequestCanceledIssue: () => console.error("Request canceled, nothing to do."),
    JsonParseIssue: () => console.error("Failed to parse the users from the response."),
  }));