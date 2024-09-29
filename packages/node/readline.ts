import { Future } from "@prophecy/core";
import { DiscriminatedIssue, UnexpectedIssue, kind } from "@prophecy/issue";
import { createInterface } from "readline/promises";
import { ReadLineOptions } from "readline";

export class ReadlineIssue implements DiscriminatedIssue {
  public readonly [kind] = "ReadlineIssue";
  public constructor(public readonly error: Error) {}
}

export const question = ({ question, ...options }: ReadLineOptions & { question: string }): Future<string, ReadlineIssue | UnexpectedIssue> => {
  return Future.from((onValue, onIssue) => {
    const readlineInterface = createInterface(options);

    readlineInterface.question(question).then(answer => {
      readlineInterface.close();
      onValue(answer);
    }).catch(error => {
      const normalizedError = error instanceof Error ? new ReadlineIssue(error) : new ReadlineIssue(new Error(String(error)));
      onIssue(normalizedError);
    });

    return null;
  });
};