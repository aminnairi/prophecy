import { DiscriminatedIssue } from "./DiscriminatedIssue";
import { Fork } from "./Fork";
import { kind } from "./kind";
import { OnIssue } from "./OnIssue";
import { OnValue } from "./OnValue";
import { ScalarValue } from "./ScalarValue";
import { Start } from "./Start";
import { UnexpectedIssue } from "./UnexpectedIssue";
import { Update } from "./Update";

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

  public static fromValue<Value extends ScalarValue>(value: Value) {
    return Future.from<Value>(emitValue => {
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

  public recover<IssueKind extends Issue[typeof kind], RecoveredIssue extends Extract<Issue, { [kind]: IssueKind }>, IssueWithoutExcludedIssue extends Exclude<Issue, RecoveredIssue>, NewValue, NewIssue extends DiscriminatedIssue>({ issue, remediation }: { issue: IssueKind, remediation: (issue: RecoveredIssue) => Future<NewValue, NewIssue> }): Future<Value | NewValue, IssueWithoutExcludedIssue | NewIssue> {
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