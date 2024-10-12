import { DiscriminatedIssue } from "@prophecy/future/DiscriminatedIssue";
import { kind } from "@prophecy/future/kind";


export class ClipboardReadTextIssue implements DiscriminatedIssue {
  public readonly [kind] = "ClipboardReadTextIssue";
  public constructor(public readonly error: Error) { }
}
