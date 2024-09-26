export const kind = Symbol("DiscriminatedIssueKind");

export interface DiscriminatedIssue {
  [kind]: string
}

export class UnexpectedIssue implements DiscriminatedIssue {
  public readonly [kind] = "UnexpectedIssue";

  public constructor(public readonly error: Error) {}
}