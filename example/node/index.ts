import { match } from "@prophecy/issue";
import { writeToPath } from "@prophecy/node";
import { sendRequestAtUrl, withAbortController } from "@prophecy/http";
import { withDelay } from "@prophecy/time";
import { toJson, toStringifiedJson, withUsers } from "./schemas/users";

withAbortController()
  .fork(abortController => {
    return withDelay({ seconds: 3 }).on({
      value: () => {
        abortController.abort();
        return null;
      },
      issue: match({
        UnexpectedIssue: () => console.error("Failed to abort the request after a delay.")
      })
    });
  })
  .fork(({ signal }) => {
    return sendRequestAtUrl("https://jsonplaceholder.typicode.com/users", { signal })
      .do(toJson)
      .do(withUsers)
      .do(toStringifiedJson({ pretty: true }))
      .do(writeToPath("users.json"))
      .on({
        issue: match({
          BadResponseIssue: issue => console.error(`Bad response from the server: ${issue.response.status}`),
          JsonParseIssue: () => console.error("Failed to parse the response to json."),
          RequestCanceledIssue: () => console.error("Request canceled, nothing to do."),
          UserValidationIssue: () => console.error("Failed to validate the users from the response."),
          UnexpectedIssue: issue => console.error(`Unexpected issue: ${issue.error}`),
        })
      });
  })
  .on({
    issue: match({
      UnexpectedIssue: () => console.error("Failed to instantiate an abort controller")
    })
  });