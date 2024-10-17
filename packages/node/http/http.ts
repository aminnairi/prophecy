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

export class HostFormatInvalidIssue implements DiscriminatedIssue {
  public readonly [kind] = "HostFormatInvalidIssue";
  public constructor(public readonly host: string) {}
}

export class HostOctetsNotNumberIssue implements DiscriminatedIssue {
  public readonly [kind] = "HostOctetsInvalidIssue";
  public constructor(public readonly host: string) {}
}

export class HostOctetsRangeIssue implements DiscriminatedIssue {
  public readonly [kind] = "HostOctetsRangeIssue";
  public constructor(public readonly host: string) {}
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
  return Future.of<Server>(onValue => {
    return onValue(createServer()); 
  });
};

export const withRoute = (matchMethod: (method: string) => boolean, matchUrl: (url: string) => boolean, handler: (request: HttpRequest) => HttpResponse) => {
  return (server: Server) => {
    return Future.of<Server>(onValue => {
      server.on("request", (httpRequest, httpResponse) => {
        const httpMethod = httpRequest.method ?? "";
        const httpUrl = httpRequest.url ?? "";

        if (matchMethod(httpMethod ?? "") &&  matchUrl(httpUrl ?? "")) {
          const response = handler({
            method: httpMethod,
            url: httpUrl
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
    return Future.of<HttpServerListenOptions, PortInfiniteIssue | PortNotNumberIssue | PortNegativeIssue | HostOctetsNotNumberIssue | HostFormatInvalidIssue | HostOctetsRangeIssue>((onValue, onIssue) => {
      if (!Number.isFinite(port)) {
        return onIssue(new PortInfiniteIssue);
      }

      if (Number.isNaN(port)) {
        return onIssue(new PortNotNumberIssue(port));
      }

      if (port < 0) {
        return onIssue(new PortNegativeIssue(port));
      }

      const hostOctets = host.split(".").map(octet => {
        return parseInt(octet);
      });

      if (hostOctets.length !== 4) {
        return onIssue(new HostFormatInvalidIssue(host));
      }

      if (hostOctets.some(octet => Number.isNaN(octet))) {
        return onIssue(new HostOctetsNotNumberIssue(host));
      }

      if (hostOctets.some(octet => octet < 0 || octet > 255)) {
        return onIssue(new HostOctetsRangeIssue(host));
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

export const withMethod = (method: string, ...expectedMethods: HttpMethod[]): boolean => {
  const uppercasedMethod = method.toUpperCase();
  return expectedMethods.some(expectedMethod => uppercasedMethod === expectedMethod);
};

export const withUrl = (pattern: string) => {
  return (url: string) => {
    const normalize = (path: string) => {
      return path.replace(/^\/+|\/+$/g, '').split('/');
    };

    const urlSegments = normalize(url);
    const patternSegments = normalize(pattern);

    if (urlSegments.length !== patternSegments.length) {
      return false;
    }

    return patternSegments.every((segment, index) => {
      if (segment.startsWith('{') && segment.endsWith('}')) {
        return true;
      }

      return segment === urlSegments[index];
    });
  };
};