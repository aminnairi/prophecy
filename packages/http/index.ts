import { Future } from "@prophecy/future";
import { kind } from "@prophecy/future/kind";
import { DiscriminatedIssue } from "@prophecy/future/DiscriminatedIssue";
import { UnexpectedIssue } from "@prophecy/future/UnexpectedIssue";

export class BadResponseIssue implements DiscriminatedIssue {
  public readonly [kind] = "BadResponseIssue";
  public constructor(public readonly response: Response) {}
}

export class RequestCanceledIssue implements DiscriminatedIssue {
  public readonly [kind] = "RequestCanceledIssue";
}

export const sendRequest = (url: string, options: RequestInit) => {
  return Future.from<string, BadResponseIssue | RequestCanceledIssue | UnexpectedIssue>((onValue, onIssue) => {
    fetch(url, options).then(response => {
      if (response.ok) {
        return response.text().then(text => {

          onValue(text);
        });
      }

      onIssue(new BadResponseIssue(response));
    }).catch(error => {
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          return onIssue(new RequestCanceledIssue);
        }

        return onIssue(new UnexpectedIssue(error));
      }

      return onIssue(new UnexpectedIssue(new Error(error)));
    }); 

    return null;
  });
};

export const sendAbortableRequest = ({ url, ...options }: RequestInit & { url: string }) => {
  return ({ abortController: { signal }, stopNextAbort }: AbortAtOutput): Future<string, BadResponseIssue | RequestCanceledIssue | UnexpectedIssue> => {
    return sendRequest(url, {
      ...options,
      signal
    }).and(stopNextAbort);
  }
}

export const createAbortController = (): Future<AbortController, UnexpectedIssue> => {
  return Future.from(onValue => {
    return onValue(new AbortController);
  });
};

export interface AbortAtOptions {
  milliseconds?: number,
  seconds?: number,
  minutes?: number,
  hours?: number
}

export interface AbortAtOutput {
  abortController: AbortController,
  stopNextAbort: <Value>(value: Value) => Future<Value, UnexpectedIssue>
}

export const abortAt = (options?: AbortAtOptions) => (abortController: AbortController): Future<AbortAtOutput, UnexpectedIssue> => {
  return Future.from(onValue => {
    const { milliseconds, seconds, minutes, hours } = {
      milliseconds: 0,
      seconds: 0,
      minutes: 0,
      hours: 0,
      ...options ?? {}
    };

    const secondsInMilliseconds = seconds * 1000;
    const minutesInMilliseconds = minutes * 60 * 1000;
    const hoursInMilliseconds = hours * 3600 * 1000;
    const delayInMilliseconds = milliseconds + secondsInMilliseconds + minutesInMilliseconds + hoursInMilliseconds;

    const timeoutIdentifier = setTimeout(() => {
      abortController.abort();
    }, delayInMilliseconds);

    const stopNextAbort = <Value>(value: Value): Future<Value, UnexpectedIssue> => {
      return Future.from((onValue) => {
        clearTimeout(timeoutIdentifier);
        return onValue(value);
      });
    };

    return onValue({ abortController, stopNextAbort });
  });
};