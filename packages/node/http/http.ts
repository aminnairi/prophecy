import { DiscriminatedIssue, Future, kind } from "@prophecy/future";
import { Server, createServer } from "http";

export class PortNegativeIssue implements DiscriminatedIssue {
  public readonly [kind] = "PortNegativeIssue";
  public constructor(public readonly port: number) {} 
}

export class PortNotNumberIssue implements DiscriminatedIssue {
  public readonly [kind] = "PortNotNumberIssue";
  public constructor(public readonly port: number) {} 
}

export class PortInfiniteIssue implements DiscriminatedIssue {
  public readonly [kind] = "PortInfiniteIssue";
}

export enum HttpMethod {
  Get = "GET",
  Post = "POST",
  Patch = "PATCH",
  Delete = "DELETE",
  Trace = "TRACE",
  Options = "OPTIONS",
  Head = "HEAD"
}

export interface HttpRequest {
  url: string,
  method: string
}

export interface HttpResponse {
  statusCode: number,
  headers: Record<string, string | string[]>,
  body: string
}

export interface HttpServerListenOptions {
  port: number,
  host: string
}

export const withServer = () => {
  return Future.from<Server>(onValue => {
    return onValue(createServer()); 
  });
};

export const withRoute = (method: string, url: string, handler: (request: HttpRequest) => HttpResponse) => {
  return (server: Server) => {
    return Future.from<Server>(onValue => {
      server.on("request", (httpRequest, httpResponse) => {
        if (httpRequest.method === method && httpRequest.url === url) {
          const response = handler({
            method: httpRequest.method,
            url: httpRequest.url
          });

          httpResponse.writeHead(response.statusCode, response.headers);
          httpResponse.end(response.body);
        }
      });

      return onValue(server);
    });
  }
};

export const listen = ({ port, host }: HttpServerListenOptions) => {
  return (server: Server) => {
    return Future.from<HttpServerListenOptions, PortInfiniteIssue | PortNotNumberIssue | PortNegativeIssue>((onValue, onIssue) => {
      if (!Number.isFinite(port)) {
        return onIssue(new PortInfiniteIssue);
      }

      if (Number.isNaN(port)) {
        return onIssue(new PortNotNumberIssue(port));
      }

      if (port < 0) {
        return onIssue(new PortNegativeIssue(port));
      }

      server.listen(port, host, () => {
        onValue({
          port,
          host
        });
      });

      return null;
    });
  };
};