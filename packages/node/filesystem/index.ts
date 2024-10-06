import { Future, DiscriminatedIssue, UnexpectedIssue, kind } from "@prophecy/future";
import { readFile, access, constants, writeFile } from "fs/promises";

export enum PathAccess {
  Readable,
  Writable,
  Visible,
  Executable
}

export class ReadFileIssue implements DiscriminatedIssue {
  public readonly [kind] = "GetBufferFromFileIssue";

  public constructor(public readonly message: string) {}
}

export class PathAccessIssue implements DiscriminatedIssue {
  public readonly [kind] = "IsFileAccessibleIssue";

  public constructor(public readonly message: string) {}
}

export const withBufferForFile = (path: string) => {
  return Future.from<Buffer, ReadFileIssue>((onValue, onIssue) => {
    readFile(path).then(buffer => {
      onValue(buffer);
    }).catch(error => {
      const message = error instanceof Error ? error.message : String(error);
      onIssue(new ReadFileIssue(message));
    });

    return null;
  });
};

export const pathAccessibleForMode = (modes: PathAccess | Array<PathAccess>, path: string) => {
  return Future.from<string, PathAccessIssue>((onValue, onIssue) => {
    const modesNormalized = Array.isArray(modes) ? modes : [modes];

    const modesCombined = modesNormalized.reduce((previousMode, currentMode) => {
      switch (currentMode) {
        case PathAccess.Executable:
          return previousMode | constants.X_OK

        case PathAccess.Readable:
          return previousMode | constants.R_OK;

        case PathAccess.Writable:
          return previousMode | constants.W_OK

        case PathAccess.Visible:
          return previousMode;
      }
    }, constants.F_OK);

    access(path, modesCombined).then(() => {
      onValue(path);
    }).catch(error => {
      const message = error instanceof Error ? error.message : String(error);
      onIssue(new PathAccessIssue(message));
    });

    return null;
  });
};

export const writeStringToFile = (path: string, data: string): Future<void> => {
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
  return (data: string): Future<string> => {
    return Future.from((onValue, onIssue) => {
      writeFile(path, data).then(() => {
        onValue(data);
      }).catch(error => {
        const errorNormalized = error instanceof Error ? error : new Error(String(error));
        onIssue(new UnexpectedIssue(errorNormalized));
      });

      return null;
    });
  }
};