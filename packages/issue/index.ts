export const kind = Symbol("DiscriminatedIssueKind");

export interface DiscriminatedIssue {
  [kind]: string
}