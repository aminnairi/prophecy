import { Prophecy } from "@prophecy/core";

export const stringFilledOr = (fallback: string) => {
  return (text: string): Prophecy<string, never> => {
    return new Prophecy(onValue => {
      if (text.trim().length === 0) {
        return onValue(fallback);
      }

      return onValue(text);
    });
  };
};