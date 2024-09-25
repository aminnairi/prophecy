import { Prophecy } from "@prophecy/core";
import { DiscriminatedIssue, kind } from "@prophecy/issue";

export class ItemNotFoundFromLocalStorageIssue implements DiscriminatedIssue {
  public readonly [kind] = "ItemNotFoundFromLocalStorageIssue";

  public constructor(public readonly key: string) {}
}

// TODO: handle the event triggered on the window and emit a value only when the window has received the event
export const clearLocalStorage = (): Prophecy<void, never> => {
  return new Prophecy((onValue) => {
    window.localStorage.clear();
    return onValue();
  });
};

// TODO: handle the event triggered on the window and emit a value only when the window has received the event
export const getItemFromLocalStorageForKey = (key: string): Prophecy<string, ItemNotFoundFromLocalStorageIssue> => {
  return new Prophecy((onValue, onIssue) => {
    const item = window.localStorage.getItem(key);

    if (item === null) {
      return onIssue(new ItemNotFoundFromLocalStorageIssue(key));
    }

    return onValue(item);
  });
};

// TODO: handle the event triggered on the window and emit a value only when the window has received the event
export const setItemToLocalStorageForKey = (key: string) => {
  return (value: string): Prophecy<string, never> => {
    return new Prophecy((onValue) => {
      window.localStorage.setItem(key, value);
      return onValue(value);
    });
  };
};

// TODO: handle the event triggered on the window and emit a value only when the window has received the event
export const removeItemFromLocalStorageForKey = (key: string) => {
  return (value: string): Prophecy<string, never> => {
    return new Prophecy((onValue) => {
      window.localStorage.removeItem(key);
      return onValue(value);
    });
  };
};