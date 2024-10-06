import { Future, DiscriminatedIssue, kind } from "@prophecy/future";
import { createInterface } from "readline/promises";
import { ReadLineOptions } from "readline";

export class ReadlineIssue implements DiscriminatedIssue {
  public readonly [kind] = "ReadlineIssue";
  public constructor(public readonly error: Error) {}
}

export const question = ({ message, ...options }: ReadLineOptions & { message: string }) => {
  return Future.from<string, ReadlineIssue>((onValue, onIssue) => {
    const readlineInterface = createInterface(options);

    readlineInterface.question(message).then(answer => {
      readlineInterface.close();
      onValue(answer);
    }).catch(error => {
      const normalizedError = error instanceof Error ? new ReadlineIssue(error) : new ReadlineIssue(new Error(String(error)));
      onIssue(normalizedError);
    });

    return null;
  });
};