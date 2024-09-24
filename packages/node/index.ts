import { Prophecy } from "@prophecy/core";
import { DiscriminatedIssue, kind } from "@prophecy/issue";
import { readFile } from "fs/promises";

export class GetBufferFromFileIssue implements DiscriminatedIssue {
  public readonly [kind] = "GetBufferFromFileIssue";

  public constructor(public readonly message: string) {}
}

export const getBufferFromFile = (path: string): Prophecy<Buffer, GetBufferFromFileIssue> => {
  return new Prophecy((onValue, onIssue) => {
    readFile(path).then(buffer => {
      onValue(buffer);
    }).catch(error => {
      const message = error instanceof Error ? error.message : String(error);
      onIssue(new GetBufferFromFileIssue(message));
    });

    return null;
  });
};