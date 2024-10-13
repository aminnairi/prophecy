# @prophecy/node/http

## Installation

```bash
npm install @prophecy/node
```

## Usage

### Create a server

```typescript
import { withServer, withRoute, listen, withMethod, withUrl, HttpMethod, HttpResponse } from "@prophecy/node/http";
import { Future } from "@prophecy/core";
import { match } from "@prophecy/issue";

withServer()
  .and(withRoute(withMethod(HttpMethod.Get), withUrl("api/hello"), () => {
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
      PortNegativeIssue: issue => console.error(`Port must be positive, ${issue.port} provided.`),
      HostFormatInvalidIssue: issue => console.error(`Host format invalid: ${issue.host}.`),
      HostOctetsNotNumberIssue: issue => console.error(`Host octets not numbers: ${issue.host}.`),
      HostOctetsRangeIssue: issue => console.error(`Host octets not in range: ${issue.host}.`)
    })
  });
```