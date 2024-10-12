import { Future } from "@prophecy/future";
import { kind } from "@prophecy/future/kind";
import { DiscriminatedIssue } from "@prophecy/future/DiscriminatedIssue";

export class UnsupportedShareIssue implements DiscriminatedIssue {
  public readonly [kind] = "UnsupportedShareIssue";
}

export class UnshearebleDataIssue<Data extends ShareData> implements DiscriminatedIssue {
  public readonly [kind] = "UnshearebleDataIssue";
  public constructor(public readonly data?: Data) {}
}

export class DocumentInnactiveForShareIssue implements DiscriminatedIssue {
  public readonly [kind] = "DocumentInnactiveForShareIssue";
}

export class ShareNotAllowedIssue implements DiscriminatedIssue {
  public readonly [kind] = "ShareNotAllowedIssue";
}

export const shareSupported = (navigator: Navigator) => {
  return Future.from<void, UnsupportedShareIssue>((emitValue, emitIssue) => {
    if (typeof navigator.share !== "function") {
      return emitIssue(new UnsupportedShareIssue);
    }

    return emitValue();
  });
}

export const canShare = <Data extends ShareData>(navigator: Navigator, data: Data) => {
  return shareSupported(navigator).and(() => {
    return Future.from<Data, UnshearebleDataIssue<Data>>((emitValue, emitIssue) => {
      const canShareData = navigator.canShare(data);

      if (!canShareData) {
        return emitIssue(new UnshearebleDataIssue(data));
      }

      return emitValue(data);
    });
  });
}

export const share = <Data extends ShareData>(navigator: Navigator, data: Data) => {
  return shareSupported(navigator).and(() => {
    return Future.from<Data, UnshearebleDataIssue<Data> | DocumentInnactiveForShareIssue | ShareNotAllowedIssue>((emitValue, emitIssue) => {
      navigator.share(data).then(() => {
        emitValue(data);
      }).catch(error => {
        if (error instanceof DOMException) {
          if (error.name === "InvalidStateError") {
            return emitIssue(new DocumentInnactiveForShareIssue);
          }

          if (error.name === "NotAllowedError") {
            return emitIssue(new ShareNotAllowedIssue);
          }

          return emitIssue(new UnshearebleDataIssue(data));
        }

        throw error;
      });

      return null;
    });
  });
};