import { Future, DiscriminatedIssue, UnexpectedIssue, kind } from "@prophecy/future";
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

export const withBufferForFile = (path: string): Future<Buffer, GetBufferFromFileIssue | UnexpectedIssue> => {
  return Future.from((onValue, onIssue) => {
    readFile(path).then(buffer => {
      onValue(buffer);
    }).catch(error => {
      const message = error instanceof Error ? error.message : String(error);
      onIssue(new GetBufferFromFileIssue(message));
    });

    return null;
  });
};

export const forFileWithAccess = (modes: FileAccess | Array<FileAccess>, path: string): Future<string, IsFileAccessibleIssue | UnexpectedIssue> => {
  return Future.from((onValue, onIssue) => {
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

export const writeStringToPath = (path: string, data: string): Future<void, UnexpectedIssue | UnexpectedIssue> => {
  return Future.from((onValue, onIssue) => {
    writeFile(path, data).then(() => {
      onValue();
    }).catch(error => {
      const errorNormalized = error instanceof Error ? error : new Error(String(error));
      onIssue(new UnexpectedIssue(errorNormalized));
    });

    return null;
  });
};

export const writeToFile = ({ path }: { path: string }) => {
  return (data: string): Future<void, UnexpectedIssue | UnexpectedIssue> => {
    return Future.from((onValue, onIssue) => {
      writeFile(path, data).then(() => {
        onValue();
      }).catch(error => {
        const errorNormalized = error instanceof Error ? error : new Error(String(error));
        onIssue(new UnexpectedIssue(errorNormalized));
      });

      return null;
    });
  }
};