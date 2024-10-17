import { DiscriminatedIssue, Future, kind } from "@prophecy/future";

export class ClipboardReadItemsIssue implements DiscriminatedIssue {
  public readonly [kind] = "ClipboardReadItemsIssue";
  public constructor(public readonly error: Error) { }
}

export class ClipboardReadTextIssue implements DiscriminatedIssue {
  public readonly [kind] = "ClipboardReadTextIssue";
  public constructor(public readonly error: Error) { }
}

export class ClipboardWriteItemsIssue implements DiscriminatedIssue {
  public readonly [kind] = "ClipboardWriteItemsIssue";
  public constructor(public readonly error: Error) { }
}

export class ClipboardWriteTextIssue implements DiscriminatedIssue {
  public readonly [kind] = "ClipboardWriteTextIssue";
  public constructor(public readonly error: Error) { }
}

export class UnsupportedClipboardIssue implements DiscriminatedIssue {
  public readonly [kind] = "UnsupportedClipboardIssue";
}

export const clipboardSupported = ({ navigator }: { navigator: Navigator; }) => {
  return Future.of<void, UnsupportedClipboardIssue>((emitValue, emitIssue) => {
    if (typeof navigator.clipboard !== "object" || navigator.clipboard === null) {
      return emitIssue(new UnsupportedClipboardIssue);
    }

    return emitValue();
  });
};

export const writeToClipboardFor = ({ navigator, text }: { navigator: Navigator, text: string }) => {
  return clipboardSupported({ navigator }).and(() => {
    return Future.of<string, ClipboardWriteTextIssue>((emitValue, emitIssue) => {
      navigator.clipboard.writeText(text).then(() => {
        emitValue(text);
      }).catch(error => {
        emitIssue(new ClipboardWriteTextIssue(error));
      });

      return null;
    });
  });
};

export const writeTextToClipboard = ({ navigator }: { navigator: Navigator }) => {
  return (text: string) => {
    return writeToClipboardFor({ navigator, text });
  }
};

export const writeItemsToClipboardFor = ({ navigator, items }: { navigator: Navigator, items: ClipboardItems }) => {
  return clipboardSupported({ navigator }).and(() => {
    return Future.of<ClipboardItems, ClipboardWriteItemsIssue>((emitValue, emitIssue) => {
      navigator.clipboard.write(items).then(() => {
        emitValue(items);
      }).catch(error => {
        emitIssue(new ClipboardWriteItemsIssue(error));
      });

      return null;
    });
  });
};

export const readTextFromClipboard = ({ navigator }: { navigator: Navigator }) => {
  return clipboardSupported({ navigator }).and(() => {
    return Future.of<string, ClipboardReadTextIssue>((emitValue, emitIssue) => {
      navigator.clipboard.readText().then(text => {
        emitValue(text);
      }).catch(error => {
        emitIssue(new ClipboardReadTextIssue(error)); 
      })

      return null;
    });
  });
};

export const readItemsFromClipboard = ({ navigator }: { navigator: Navigator }) => {
  return clipboardSupported({ navigator }).and(() => {
    return Future.of<ClipboardItems, ClipboardReadItemsIssue>((emitValue, emitIssue) => {
      navigator.clipboard.read().then(items => {
        emitValue(items);
      }).catch(error => {
        emitIssue(new ClipboardReadItemsIssue(error));
      });

      return null;
    });
  });
};