import { Future } from "@prophecy/core";
import { UnexpectedIssue } from "@prophecy/issue";

export const stringFilledOr = (fallback: string) => {
  return (text: string): Future<string, UnexpectedIssue> => {
    return Future.from(onValue => {
      if (text.trim().length === 0) {
        return onValue(fallback);
      }

      return onValue(text);
    });
  };
};

export const whenEmpty = (fallback: string) => (text: string): Future<string, UnexpectedIssue> => {
  return Future.from(onValue => {
    return onValue(text.trim().length === 0 ? fallback : text);
  });
};

export const withString = (data: unknown): Future<string, UnexpectedIssue> => {
  return Future.from(onValue => {
    return onValue(String(data));
  });
};