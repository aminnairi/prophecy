import { DiscriminatedIssue } from "@prophecy/future/DiscriminatedIssue";
import { kind } from "@prophecy/future/kind";


export class ClipboardReadItemsIssue implements DiscriminatedIssue {
  public readonly [kind] = "ClipboardReadItemsIssue";
  public constructor(public readonly error: Error) { }
}
