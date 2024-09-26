import { Future } from "@prophecy/core";
import { DiscriminatedIssue, kind } from "@prophecy/issue";
import { readFile, access, constants } from "fs/promises";

export enum FileAccessibility {
  Readable,
  Writable,
  Visible,
  Executable
}

export class GetBufferFromFileIssue implements DiscriminatedIssue {
  public readonly [kind] = "GetBufferFromFileIssue";

  public constructor(public readonly message: string) {}
}

export class IsFileAccessibleIssue implements DiscriminatedIssue {
  public readonly [kind] = "IsFileAccessibleIssue";

  public constructor(public readonly message: string) {}
}

export const getBufferFromFile = (path: string): Future<Buffer, GetBufferFromFileIssue> => {
  return new Future((onValue, onIssue) => {
    readFile(path).then(buffer => {
      onValue(buffer);
    }).catch(error => {
      const message = error instanceof Error ? error.message : String(error);
      onIssue(new GetBufferFromFileIssue(message));
    });

    return null;
  });
};

export const isFileAccessible = (path: string, modes: FileAccessibility | Array<FileAccessibility> = FileAccessibility.Visible): Future<string, IsFileAccessibleIssue> => {
  return new Future((onValue, onIssue) => {
    const modesNormalized = Array.isArray(modes) ? modes : [modes];

    const modesCombined = modesNormalized.reduce((previousMode, currentMode) => {
      switch (currentMode) {
        case FileAccessibility.Executable:
          return previousMode | constants.X_OK

        case FileAccessibility.Readable:
          return previousMode | constants.R_OK;

        case FileAccessibility.Writable:
          return previousMode | constants.W_OK

        case FileAccessibility.Visible:
          return previousMode;
      }
    }, constants.F_OK);

    access(path, modesCombined).then(() => {
      onValue(path);
    }).catch(error => {
      const message = error instanceof Error ? error.message : String(error);
      onIssue(new IsFileAccessibleIssue(message));
    });

    return null;
  });
};