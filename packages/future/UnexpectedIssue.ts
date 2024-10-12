import { kind } from "./kind";
import { DiscriminatedIssue } from "./DiscriminatedIssue";


export class UnexpectedIssue implements DiscriminatedIssue {
  public readonly [kind] = "UnexpectedIssue";

  public constructor(public readonly error: Error) { }
}
