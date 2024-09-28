import { Future } from "@prophecy/core";
import { DiscriminatedIssue, UnexpectedIssue, kind } from "@prophecy/issue";
import { readFile, access, constants, writeFile } from "fs/promises";

export enum FileAccess {
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

export const withBufferForFile = (path: string): Future<Buffer, GetBufferFromFileIssue> => {
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

export const forFileWithAccess = (modes: FileAccess | Array<FileAccess>, path: string): Future<string, IsFileAccessibleIssue> => {
  return new Future((onValue, onIssue) => {
    const modesNormalized = Array.isArray(modes) ? modes : [modes];

    const modesCombined = modesNormalized.reduce((previousMode, currentMode) => {
      switch (currentMode) {
        case FileAccess.Executable:
          return previousMode | constants.X_OK

        case FileAccess.Readable:
          return previousMode | constants.R_OK;

        case FileAccess.Writable:
          return previousMode | constants.W_OK

        case FileAccess.Visible:
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

export const writeStringToPath = (path: string, data: string): Future<never, UnexpectedIssue> => {
  return new Future((onValue, onIssue) => {
    writeFile(path, data).then(() => {
      onValue(undefined as never);
    }).catch(error => {
      const errorNormalized = error instanceof Error ? error : new Error(String(error));
      onIssue(new UnexpectedIssue(errorNormalized));
    });

    return null;
  });
};

export const writeToFile = ({ path }: { path: string }) => {
  return (data: string): Future<never, UnexpectedIssue> => {
    return new Future((onValue, onIssue) => {
      writeFile(path, data).then(() => {
        onValue(undefined as never);
      }).catch(error => {
        const errorNormalized = error instanceof Error ? error : new Error(String(error));
        onIssue(new UnexpectedIssue(errorNormalized));
      });

      return null;
    });
  }
};