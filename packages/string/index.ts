import { Future } from "@prophecy/future";

export const stringFilledOr = (fallback: string) => {
  return (text: string): Future<string> => {
    return Future.from(onValue => {
      if (text.trim().length === 0) {
        return onValue(fallback);
      }

      return onValue(text);
    });
  };
};

export const whenEmpty = (fallback: string) => (text: string): Future<string> => {
  return Future.from(onValue => {
    return onValue(text.trim().length === 0 ? fallback : text);
  });
};

export const asString = (data: unknown): Future<string> => {
  return Future.from(onValue => {
    return onValue(String(data));
  });
};