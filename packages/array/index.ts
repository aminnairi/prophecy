import { DiscriminatedIssue, Future, kind  } from "@prophecy/future";

export class IndexNotFoundIssue<Item> implements DiscriminatedIssue {
  public readonly [kind] = "IndexNotFoundIssue";

  public constructor(public readonly array: Array<Item>, public readonly index: number) {}
}

export const getArrayItemAt = (index: number) => {
  return <Item>(prophecy: Future<Array<Item>>) => {
    return prophecy.and(items => {
      return Future.of<Item, IndexNotFoundIssue<Item>>((onValue, onIssue) => {
        const item = items.at(index);

        if (item === undefined) {
          return onIssue(new IndexNotFoundIssue(items, index));
        }

        return onValue(item);
      });
    })
  };
};