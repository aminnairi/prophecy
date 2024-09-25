import { Prophecy } from "@prophecy/core";
import { DiscriminatedIssue, kind } from "@prophecy/issue";

export class GetArrayItemAtIndexIssue<Item> implements DiscriminatedIssue {
  public readonly [kind] = "GetArrayItemAtIndexIssue";

  public constructor(public readonly array: Array<Item>, public readonly index: number) {}
}

export const getArrayItemAt = (index: number) => {
  return <Item>(prophecy: Prophecy<Array<Item>, GetArrayItemAtIndexIssue<Item>>) => {
    return prophecy.andThen(items => {
      return new Prophecy((onValue, onIssue) => {
        const item = items.at(index);

        if (item === undefined) {
          return onIssue(new GetArrayItemAtIndexIssue(items, index));
        }

        return onValue(item);
      });
    })
  };
};