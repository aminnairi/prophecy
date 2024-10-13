
export type Fork<Value> = (value: Value) => null;

export type OnIssue<Issue> = (issue: Issue) => null;

export type OnValue<Value> = (value: Value) => null;

export type ScalarArray = Array<ScalarValue>;

export type ScalarRecord = {
  [key: string | number | symbol]: ScalarValue;
};

export type ScalarValue =
  | string
  | number
  | boolean
  | bigint
  | symbol
  | null
  | undefined
  | ScalarArray
  | ScalarRecord;

export type Start<Value, Issue> = (emitValue: OnValue<Value>, emitIssue: OnIssue<Issue>) => null;

export type Update<Value, NewValue, NewIssue extends DiscriminatedIssue> = (value: Value) => Future<NewValue, NewIssue>;

export interface DiscriminatedIssue {
  [kind]: string;
}

export const kind = Symbol("DiscriminatedIssueKind");

export function match<Issue extends DiscriminatedIssue>(patterns: {
  [Key in Issue[typeof kind]]: (issue: Extract<Issue, { [kind]: Key; }>) => unknown;
}) {
  return (issue: Issue): null => {
    const issueKind = issue[kind];

    if (issueKind in patterns) {
      // @ts-ignore
      return patterns[issueKind](issue);
    } else {
      throw new Error(`No handler for issue kind: ${issueKind}`);
    }
  };
}

export class UnexpectedIssue implements DiscriminatedIssue {
  public readonly [kind] = "UnexpectedIssue";

  public constructor(public readonly error: Error) { }
}

export class Future<Value = never, Issue extends DiscriminatedIssue = UnexpectedIssue> {
  private constructor(private readonly observer: Start<Value, Issue>) { }

  public static from<Value = never, Issue extends DiscriminatedIssue = UnexpectedIssue>(start: Start<Value, Issue>): Future<Value, Issue | UnexpectedIssue> {
    return new Future<Value, Issue | UnexpectedIssue>((emitValue, emitIssue) => {
      try {
        return start(emitValue, emitIssue);
      } catch (error) {
        const unexpectedIssue = error instanceof Error ? new UnexpectedIssue(error) : new UnexpectedIssue(new Error(String(error)));
        return emitIssue(unexpectedIssue);
      }
    });
  }

  public static fromValue<Value extends ScalarValue>(value: Value): Future<Value> {
    return Future.from(emitValue => {
      return emitValue(value);
    });
  }

  public static fromIssue<GenericIssue extends DiscriminatedIssue>(issue: GenericIssue) {
    return Future.from<never, GenericIssue>((emitValue, emitIssue) => {
      return emitIssue(issue);
    });
  }

  public and<NewValue, NewIssue extends DiscriminatedIssue>(update: Update<Value, NewValue, NewIssue>): Future<NewValue, Issue | NewIssue | UnexpectedIssue> {
    return new Future((emitValue, emitIssue) => {
      try {
        return this.on({
          issue: emitIssue,
          value: value => update(value).on({
            issue: emitIssue,
            value: emitValue,
          })
        });
      } catch (error) {
        const errorNormalized = error instanceof Error ? error : new Error(String(error));
        return emitIssue(new UnexpectedIssue(errorNormalized));
      }
    });
  }

  public recover<IssueKind extends Issue[typeof kind], RecoveredIssue extends Extract<Issue, { [kind]: IssueKind }>, IssueWithoutExcludedIssue extends Exclude<Issue, RecoveredIssue>, NewValue, NewIssue extends DiscriminatedIssue>(issue: IssueKind, remediation: (issue: RecoveredIssue) => Future<NewValue, NewIssue>): Future<Value | NewValue, IssueWithoutExcludedIssue | NewIssue> {
    return new Future((emitValue, emitIssue) => {
      this.on({
        issue: nextIssue => {
          if (nextIssue[kind] === issue) {
            return remediation(nextIssue as unknown as RecoveredIssue).on({
              issue: emitIssue,
              value: emitValue
            });
          }

          return emitIssue(nextIssue as unknown as IssueWithoutExcludedIssue);
        },
        value: emitValue
      });
      return null;
    });
  }

  public parallel(fork: Fork<Value>): Future<Value, Issue | UnexpectedIssue> {
    return this.and(value => {
      return new Future(emitValue => {
        fork(value);
        return emitValue(value);
      });
    });
  }

  public on({ issue, value = () => null }: { issue: OnIssue<Issue>, value?: OnValue<Value> }): null {
    return this.observer(value, issue);
  }
}