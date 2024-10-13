import { Future } from "@prophecy/future";

export interface WithDelayOptions {
  milliseconds?: number,
  seconds?: number,
  minutes?: number,
  hours?: number 
}

export interface WithDelayOutput {
  total: number,
  milliseconds: number,
  seconds: number,
  minutes: number,
  hours: number
}

export const withDelay = (options?: WithDelayOptions) => {
  return Future.from<WithDelayOutput>(onValue => {
    const { milliseconds, seconds, minutes, hours } = { milliseconds: 0, seconds: 0, minutes: 0, hours: 0, ...options ?? {} };
    const secondsInMilliseconds = seconds * 1000;
    const minutesInMilliseconds = minutes * 60 * 1000;
    const hoursInMilliseconds = hours * 3600 * 1000;
    const computedMilliseconds = milliseconds + secondsInMilliseconds + minutesInMilliseconds + hoursInMilliseconds;

    setTimeout(() => {
      onValue({
        total: computedMilliseconds,
        milliseconds,
        seconds,
        minutes,
        hours
      });
    }, computedMilliseconds);

    return null;
  });
};