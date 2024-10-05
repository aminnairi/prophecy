# @prophecy/node/http

## Usage

### Create a server

```typescript
import { withServer, withRoute, listen, HttpMethod, HttpResponse } from "@prophecy/node/http";
import { Future } from "@prophecy/core";
import { match } from "@prophecy/issue";

withServer()
  .and(withRoute(HttpMethod.Get, "/hello", () => {
    return Future.from<HttpResponse>(emitValue => {
      return emitValue({
        statusCode: 200,
        headers: {},
        body: "Hello, world!"
      });
    });
  }))
  .and(listen({
    port: 8000,
    host: "0.0.0.0"
  }))
  .on({
    issue: match({
      UnexpectedIssue: issue => console.error(`Unexpected issue: ${issue.error}`),
      PortInfiniteIssue: () => console.error("Port cannot be infinite."),
      PortNotNumberIssue: issue => console.error(`Port must be a number, ${issue.port} provided.`),
      PortNegativeIssue: issue => console.error(`Port must be positive, ${issue.port} provided.`)
    })
  });
```