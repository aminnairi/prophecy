import { Future } from "@prophecy/core";

export const stringFilledOr = (fallback: string) => {
  return (text: string): Future<string, never> => {
    return new Future(onValue => {
      if (text.trim().length === 0) {
        return onValue(fallback);
      }

      return onValue(text);
    });
  };
};

export const whenEmpty = (fallback: string) => (text: string): Future<string, never> => {
  return new Future(onValue => {
    return onValue(text.trim().length === 0 ? fallback : text);
  });
};