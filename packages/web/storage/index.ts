import { DiscriminatedIssue, Future, kind } from "@prophecy/future";

export class StorageItemNotFoundIssue implements DiscriminatedIssue {
  public readonly [kind] = "StorageItemNotFoundIssue";

  public constructor(public readonly key: string) {}
}

export const clearStorage = ({ storage }: { storage: Storage }) => {
  return Future.from<void>((onValue) => {
    storage.clear();
    return onValue();
  });
};

export const getStorageItem = ({ storage, key }: { key: string, storage: Storage }) => {
  return Future.from<string, StorageItemNotFoundIssue>((onValue, onIssue) => {
    const item = storage.getItem(key);

    if (item === null) {
      return onIssue(new StorageItemNotFoundIssue(key));
    }

    return onValue(item);
  });
};

export const setStorageItem = ({ storage, key, value }: { key: string, value: string, storage: Storage }) => {
  return Future.from<string>((onValue) => {
    storage.setItem(key, value);
    return onValue(value);
  });
};

export const setStorageItemForValue = ({ storage, key }: { key: string, storage: Storage }) => {
  return (value: string) => {
    return Future.from<string>((onValue) => {
      storage.setItem(key, value);
      return onValue(value);
    });
  }
};

export const removeStorageItem = ({ storage, key }: { key: string, storage: Storage }) => {
  return Future.from<string>((onValue) => {
    storage.removeItem(key);
    return onValue(key);
  });
};