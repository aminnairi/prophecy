import { Future, match } from "@prophecy/future";
import { writeToFile } from "@prophecy/node/filesystem";
import { abortAt, createAbortController, sendAbortableRequest } from "@prophecy/http";
import { Users, toJson, toStringifiedJson, toUsers } from "./schemas/users";
import { forAnyMethod, forAnyPath, forMethod, forPath, HttpMethod, listen, withRoute, withServer } from "@prophecy/node/http/http";

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

withServer()
  .and(withRoute({
    method: forMethod(HttpMethod.Get),
    path: forPath("/hello"),
    handler: () => Future.of((onValue) => onValue({
      body: "world!",
      statusCode: 200,
      headers: {}
    }))
  }))
  .and(withRoute({
    path: forAnyPath,
    method: forAnyMethod,
    handler: () => Future.of(onValue => onValue({
      body: "Not found",
      statusCode: 404,
      headers: {}
    }))
  }))
  .and(listen({
    port: 8000,
    host: "0.0.0.0"
  }))
  .parallel(() => {
    console.log("Starting HTTP server");
    return null;
  })
  .run(match({
    HostFormatInvalidIssue: () => {
      console.error("Host format is invalid.");
    },
    HostOctetsInvalidIssue: () => {
      console.error("Host octets invalid.");
    },
    HostOctetsRangeIssue: () => {
      console.error("Hosts octets not in range.");
    },
    PortInfiniteIssue: () => {
      console.error("Port is inifinite");
    },
    PortNegativeIssue: () => {
      console.error("Port is negative");
    },
    PortNotNumberIssue: () => {
      console.error("Port is not in range.");
    },
    UnexpectedIssue: () => {
      console.error("An error occurred");
    }
  }))