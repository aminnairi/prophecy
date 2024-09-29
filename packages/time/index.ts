import { Future } from "@prophecy/core";
import { UnexpectedIssue } from "@prophecy/issue";

export interface WithDelayOptions {
  milliseconds?: number,
  seconds?: number,
  minutes?: number,
  hours?: number 
}

export const withDelay = (options?: WithDelayOptions): Future<void, UnexpectedIssue> => {
  const { milliseconds, seconds, minutes, hours } = { milliseconds: 0, seconds: 0, minutes: 0, hours: 0, ...options ?? {} };
  const secondsInMilliseconds = seconds * 1000;
  const minutesInMilliseconds = minutes * 60 * 1000;
  const hoursInMilliseconds = hours * 3600 * 1000;

  return Future.from(onValue => {
    const computedMilliseconds = milliseconds + secondsInMilliseconds + minutesInMilliseconds + hoursInMilliseconds;

    setTimeout(() => {
      onValue();
    }, computedMilliseconds);

    return null;
  });
};