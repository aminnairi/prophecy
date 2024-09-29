import { Future } from "@prophecy/core";
import { DiscriminatedIssue, UnexpectedIssue, kind } from "@prophecy/issue";

export class StorageItemNotFoundIssue implements DiscriminatedIssue {
  public readonly [kind] = "StorageItemNotFoundIssue";

  public constructor(public readonly key: string) {}
}

export const clearStorage = ({ storage }: { storage: Storage }): Future<void, UnexpectedIssue> => {
  return Future.from((onValue) => {
    storage.clear();
    return onValue();
  });
};

export const getStorageItem = ({ storage, key }: { key: string, storage: Storage }): Future<string, StorageItemNotFoundIssue | UnexpectedIssue> => {
  return Future.from((onValue, onIssue) => {
    const item = storage.getItem(key);

    if (item === null) {
      return onIssue(new StorageItemNotFoundIssue(key));
    }

    return onValue(item);
  });
};

export const setStorageItem = ({ storage, key, value }: { key: string, value: string, storage: Storage }): Future<string, UnexpectedIssue> => {
  return Future.from((onValue) => {
    storage.setItem(key, value);
    return onValue(value);
  });
};

export const setStorageItemForValue = ({ storage, key }: { key: string, storage: Storage }) => {
  return (value: string): Future<string, UnexpectedIssue>  => {
    return Future.from((onValue) => {
      storage.setItem(key, value);
      return onValue(value);
    });
  }
};

export const removeStorageItem = ({ storage, key }: { key: string, storage: Storage }): Future<void, UnexpectedIssue> => {
  return Future.from((onValue) => {
    storage.removeItem(key);
    return onValue();
  });
};