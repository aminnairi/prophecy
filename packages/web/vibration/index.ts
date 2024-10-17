import { DiscriminatedIssue, Future, kind, UnexpectedIssue  } from "@prophecy/future";

export class VibrateInvalidArgumentIssue implements DiscriminatedIssue {
  public readonly [kind] = "VibrateInvalidArgumentIssue";

  public constructor(public readonly pattern: VibratePattern) {}
}

export class VibrationUnsupportedIssue implements DiscriminatedIssue {
  public readonly [kind] = "VibrationUnsupportedIssue";
}

export const vibrationSupported = (): Future<void, VibrationUnsupportedIssue | UnexpectedIssue> => {
  return Future.of((onValue, onIssue) => {
    if (typeof window !== "object" || window === null || typeof window.navigator !== "object" || window.navigator === null || typeof window.navigator.vibrate !== "function") {
      return onIssue(new VibrationUnsupportedIssue);
    }

    return onValue();
  });
}; 

export const vibrate = (pattern: VibratePattern): Future<VibratePattern, VibrationUnsupportedIssue | VibrateInvalidArgumentIssue | UnexpectedIssue> => {
  return vibrationSupported().and(() => {
    return Future.of((onValue, onIssue) => {
      const hasValidArguments = navigator.vibrate(pattern);

      if (!hasValidArguments) {
        return onIssue(new VibrateInvalidArgumentIssue(pattern));
      }

      return onValue(pattern);
    });
  });
};

export const cancelVibration = (): Future<void, VibrationUnsupportedIssue | UnexpectedIssue> => {
  return vibrationSupported().and(() => {
    return Future.of((onValue) => {
      navigator.vibrate(0);
      return onValue();
    });
  });
};