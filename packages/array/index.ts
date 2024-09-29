import { Future } from "@prophecy/core";
import { DiscriminatedIssue, UnexpectedIssue, kind } from "@prophecy/issue";

export class GetArrayItemAtIndexIssue<Item> implements DiscriminatedIssue {
  public readonly [kind] = "GetArrayItemAtIndexIssue";

  public constructor(public readonly array: Array<Item>, public readonly index: number) {}
}

export const getArrayItemAt = (index: number) => {
  return <Item>(prophecy: Future<Array<Item>, UnexpectedIssue>): Future<Item, GetArrayItemAtIndexIssue<Item> | UnexpectedIssue> => {
    return prophecy.and(items => {
      return Future.from((onValue, onIssue) => {
        const item = items.at(index);

        if (item === undefined) {
          return onIssue(new GetArrayItemAtIndexIssue(items, index));
        }

        return onValue(item);
      });
    })
  };
};