import { Future, DiscriminatedIssue, UnexpectedIssue, kind  } from "@prophecy/future";

export class IndexNotFoundIssue<Item> implements DiscriminatedIssue {
  public readonly [kind] = "IndexNotFoundIssue";

  public constructor(public readonly array: Array<Item>, public readonly index: number) {}
}

export const getArrayItemAt = (index: number) => {
  return <Item>(prophecy: Future<Array<Item>, UnexpectedIssue>): Future<Item, IndexNotFoundIssue<Item> | UnexpectedIssue> => {
    return prophecy.and(items => {
      return Future.from((onValue, onIssue) => {
        const item = items.at(index);

        if (item === undefined) {
          return onIssue(new IndexNotFoundIssue(items, index));
        }

        return onValue(item);
      });
    })
  };
};