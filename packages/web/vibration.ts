import { Prophecy } from "@prophecy/core";
import { DiscriminatedIssue, kind } from "@prophecy/issue";

export class VibrateInvalidArgumentIssue implements DiscriminatedIssue {
  public readonly [kind] = "VibrateInvalidArgumentIssue";

  public constructor(public readonly pattern: VibratePattern) {}
}

export class VibrationUnsupportedIssue implements DiscriminatedIssue {
  public readonly [kind] = "VibrationUnsupportedIssue";
}

export const vibrationSupported = (): Prophecy<void, VibrationUnsupportedIssue> => {
  return new Prophecy((onValue, onIssue) => {
    if (typeof window !== "object" || window === null || typeof window.navigator !== "object" || window.navigator === null || typeof window.navigator.vibrate !== "function") {
      return onIssue(new VibrationUnsupportedIssue);
    }

    return onValue();
  });
}; 

export const vibrate = (pattern: VibratePattern): Prophecy<VibratePattern, VibrationUnsupportedIssue | VibrateInvalidArgumentIssue> => {
  return vibrationSupported().andThen(() => {
    return new Prophecy((onValue, onIssue) => {
      const hasValidArguments = navigator.vibrate(pattern);

      if (!hasValidArguments) {
        return onIssue(new VibrateInvalidArgumentIssue(pattern));
      }

      return onValue(pattern);
    });
  });
};

export const cancelVibration = (): Prophecy<void, VibrationUnsupportedIssue> => {
  return vibrationSupported().andThen(() => {
    return new Prophecy((onValue) => {
      navigator.vibrate(0);
      return onValue();
    });
  });
};