import { Future } from "@prophecy/core";
import { DiscriminatedIssue, UnexpectedIssue, kind } from "@prophecy/issue";

export class BadResponseIssue implements DiscriminatedIssue {
  public readonly [kind] = "BadResponseIssue";
  public constructor(public readonly response: Response) {}
}

export class RequestCanceledIssue implements DiscriminatedIssue {
  public readonly [kind] = "RequestCanceledIssue";
}

export const sendRequestAtUrl = (url: string, options: RequestInit): Future<string, BadResponseIssue | RequestCanceledIssue | UnexpectedIssue> => {
  return new Future((onValue, onIssue) => {
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
          onIssue(new RequestCanceledIssue);
          return;
        }

        onIssue(new UnexpectedIssue(error));
        return
      }

      onIssue(new UnexpectedIssue(new Error(error)));
    }); 

    return null;
  });
};

export const withAbortController = (): Future<AbortController, never> => {
  return new Future(onValue => {
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
  stopTimeout: <Value>(value: Value) => Future<Value, never>
}

export const abortAt = (options?: AbortAtOptions) => (abortController: AbortController): Future<AbortAtOutput, UnexpectedIssue> => {
  return new Future(onValue => {
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

    const stopTimeout = <Value>(value: Value): Future<Value, never> => {
      return new Future((onValue) => {
        clearTimeout(timeoutIdentifier);
        return onValue(value);
      });
    };

    return onValue({ abortController, stopTimeout });
  });
};