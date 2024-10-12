import { Future  } from "@prophecy/future";
import { kind } from "@prophecy/future/kind";
import { DiscriminatedIssue } from "@prophecy/future/DiscriminatedIssue";

export class IndexNotFoundIssue<Item> implements DiscriminatedIssue {
  public readonly [kind] = "IndexNotFoundIssue";

  public constructor(public readonly array: Array<Item>, public readonly index: number) {}
}

export const getArrayItemAt = (index: number) => {
  return <Item>(prophecy: Future<Array<Item>>) => {
    return prophecy.and(items => {
      return Future.from<Item, IndexNotFoundIssue<Item>>((onValue, onIssue) => {
        const item = items.at(index);

        if (item === undefined) {
          return onIssue(new IndexNotFoundIssue(items, index));
        }

        return onValue(item);
      });
    })
  };
};