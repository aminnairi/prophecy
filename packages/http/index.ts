import { Future } from "@prophecy/core";
import { DiscriminatedIssue, UnexpectedIssue, kind } from "@prophecy/issue";

export class OfflineIssue implements DiscriminatedIssue {
  public readonly [kind] = "OfflineIssue";
}

export class BadResponseIssue implements DiscriminatedIssue {
  public readonly [kind] = "BadResponseIssue";
  public constructor(public readonly response: Response) {}
}

export class RequestCanceledIssue implements DiscriminatedIssue {
  public readonly [kind] = "RequestCanceledIssue";
}

export const sendRequestAtUrl = (url: string, options: RequestInit): Future<string, OfflineIssue | BadResponseIssue | RequestCanceledIssue | UnexpectedIssue> => {
  return new Future((onValue, onIssue) => {
    if (!navigator.onLine) {
      return onIssue(new OfflineIssue);
    }

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