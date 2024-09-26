export const kind = Symbol("DiscriminatedIssueKind");

export interface DiscriminatedIssue {
  [kind]: string
}

export class UnexpectedIssue implements DiscriminatedIssue {
  public readonly [kind] = "UnexpectedIssue";

  public constructor(public readonly error: Error) {}
}

export function match<Issue extends DiscriminatedIssue>(patterns: { [Key in Issue[typeof kind]]: (issue: Extract<Issue, { [kind]: Key }>) => unknown }) {
  return (issue: Issue): null => {
    const issueKind = issue[kind];

    if (issueKind in patterns) {
      // @ts-ignore
      return patterns[issueKind](issue);
    } else {
      throw new Error(`No handler for issue kind: ${issueKind}`);
    }
  }
}