import { Future } from "@prophecy/core";
import { DiscriminatedIssue, kind } from "@prophecy/issue";

export class ItemNotFoundFromLocalStorageIssue implements DiscriminatedIssue {
  public readonly [kind] = "ItemNotFoundFromLocalStorageIssue";

  public constructor(public readonly key: string) {}
}

// TODO: handle the event triggered on the window and emit a value only when the window has received the event
export const clearStorage = ({ storage }: { storage: Storage }): Future<void, never> => {
  return new Future((onValue) => {
    storage.clear();
    return onValue();
  });
};

// TODO: handle the event triggered on the window and emit a value only when the window has received the event
export const getStorageItem = ({ storage, key }: { key: string, storage: Storage }): Future<string, ItemNotFoundFromLocalStorageIssue> => {
  return new Future((onValue, onIssue) => {
    const item = storage.getItem(key);

    if (item === null) {
      return onIssue(new ItemNotFoundFromLocalStorageIssue(key));
    }

    return onValue(item);
  });
};

// TODO: handle the event triggered on the window and emit a value only when the window has received the event
export const setStorageItem = ({ storage, key }: { key: string, storage: Storage }) => {
  return (value: string): Future<string, never> => {
    return new Future((onValue) => {
      storage.setItem(key, value);
      return onValue(value);
    });
  };
};

// TODO: handle the event triggered on the window and emit a value only when the window has received the event
export const removeStorageItem = ({ storage, key }: { key: string, storage: Storage }) => {
  return (value: string): Future<string, never> => {
    return new Future((onValue) => {
      storage.removeItem(key);
      return onValue(value);
    });
  };
};