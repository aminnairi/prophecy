import { match } from "@prophecy/issue";
import { writeToPath } from "@prophecy/node/filesystem";
import { abortAt, sendRequestAtUrl, withAbortController } from "@prophecy/http";
import { toJson, toStringifiedJson, toUsers } from "./schemas/users";
import { Future } from "@prophecy/core";

withAbortController()
  .and(abortAt({ seconds: 5 }))
  .and(({ signal }) => sendRequestAtUrl("https://jsonplaceholder.typicode.com/users", { signal }))
  .and(toJson)
  .and(toUsers)
  .and(toStringifiedJson({ pretty: true }))
  .and(writeToPath("users.json"))
  .recover("BadResponseIssue", issue => new Future<number, never>((onValue) => onValue(123)))
  .run({
    onIssue: match({
      UnexpectedIssue: () => console.error("Failed to instantiate an abort controller"),
      JsonParseIssue: () => console.error("Failed to parse the response to json."),
      RequestCanceledIssue: () => console.error("Request canceled, nothing to do."),
      UserValidationIssue: () => console.error("Failed to validate the users from the response."),
    }),
    onValue: value => {
      return null;
    }
  });