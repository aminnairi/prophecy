import { DiscriminatedIssue } from "@prophecy/future/DiscriminatedIssue";
import { kind } from "@prophecy/future/kind";


export class UnsupportedClipboardIssue implements DiscriminatedIssue {
  public readonly [kind] = "UnsupportedClipboardIssue";
}
