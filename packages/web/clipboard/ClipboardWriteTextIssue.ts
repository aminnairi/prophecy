import { DiscriminatedIssue } from "@prophecy/future/DiscriminatedIssue";
import { kind } from "@prophecy/future/kind";


export class ClipboardWriteTextIssue implements DiscriminatedIssue {
  public readonly [kind] = "ClipboardWriteTextIssue";
  public constructor(public readonly error: Error) { }
}
