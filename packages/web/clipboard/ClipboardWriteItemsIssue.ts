import { DiscriminatedIssue } from "@prophecy/future/DiscriminatedIssue";
import { kind } from "@prophecy/future/kind";


export class ClipboardWriteItemsIssue implements DiscriminatedIssue {
  public readonly [kind] = "ClipboardWriteItemsIssue";
  public constructor(public readonly error: Error) { }
}
