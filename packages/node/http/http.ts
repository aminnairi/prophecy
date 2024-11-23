import { DiscriminatedIssue, Future, kind, UnexpectedIssue } from "@prophecy/future";
import { Server, createServer } from "http";

export class PortNegativeIssue implements DiscriminatedIssue {
  public readonly [kind] = "PortNegativeIssue";
  public constructor(public readonly port: number) { }
}

export class PortNotNumberIssue implements DiscriminatedIssue {
  public readonly [kind] = "PortNotNumberIssue";
  public constructor(public readonly port: number) { }
}

export class PortInfiniteIssue implements DiscriminatedIssue {
  public readonly [kind] = "PortInfiniteIssue";
}

export class HostFormatInvalidIssue implements DiscriminatedIssue {
  public readonly [kind] = "HostFormatInvalidIssue";
  public constructor(public readonly host: string) { }
}

export class HostOctetsNotNumberIssue implements DiscriminatedIssue {
  public readonly [kind] = "HostOctetsInvalidIssue";
  public constructor(public readonly host: string) { }
}

export class HostOctetsRangeIssue implements DiscriminatedIssue {
  public readonly [kind] = "HostOctetsRangeIssue";
  public constructor(public readonly host: string) { }
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

export type HttpRouteHandler<GenericIssue extends DiscriminatedIssue> = (request: HttpRequest) => Future<HttpResponse, GenericIssue>

export interface HttpRoute<GenericIssue extends DiscriminatedIssue> {
  method: (method: HttpMethod) => boolean,
  path: (path: string) => boolean
  handler: HttpRouteHandler<GenericIssue>
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

export const toHttpMethod = (method: string): HttpMethod => {
  switch (method) {
    case HttpMethod.Delete:
      return method;

    case HttpMethod.Get:
      return method

    case HttpMethod.Head:
      return method;

    case HttpMethod.Options:
      return method;

    case HttpMethod.Patch:
      return method;

    case HttpMethod.Post:
      return method;

    case HttpMethod.Trace:
      return method;
  }

  return HttpMethod.Get;
};

export const withRoute = <GenericIssue extends DiscriminatedIssue>(route: HttpRoute<GenericIssue>) => {
  return (server: Server) => {
    return Future.of<Server, GenericIssue | UnexpectedIssue>((onValue, onIssue) => {
      server.on("request", (httpRequest, httpResponse) => {
        const httpMethod = toHttpMethod(httpRequest.method ?? "");
        const httpUrl = httpRequest.url ?? "";

        if (route.method(httpMethod) && route.path(httpUrl)) {
          const futureResponse = route.handler({
            method: httpMethod,
            url: httpUrl
          });

          futureResponse.parallel(response => {
            httpResponse.writeHead(response.statusCode, response.headers);
            httpResponse.end(response.body);
            return null;
          }).run(onIssue);
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

export const forMethod = (...expectedMethods: HttpMethod[]) => {
  return (method: HttpMethod) => {
    const uppercasedMethod = method.toUpperCase();
    return expectedMethods.some(expectedMethod => uppercasedMethod === expectedMethod);
  }
};

export const forPath = (pattern: string) => {
  return (uri: string) => {
    const normalize = (path: string) => {
      return path.replace(/^\/+|\/+$/g, '').split('/');
    };

    const urlSegments = normalize(uri);
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

export const forAnyMethod = () => true

export const forAnyPath = () => true;