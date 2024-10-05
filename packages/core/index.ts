import { DiscriminatedIssue, UnexpectedIssue, kind } from "@prophecy/issue";

export type OnIssue<Issue> = (issue: Issue) => null;

export type OnValue<Value> = (value: Value) => null;

export type Start<Value, Issue> = (emitValue: OnValue<Value>, emitIssue: OnIssue<Issue>) => null;

export type Update<Value, NewValue, NewIssue extends DiscriminatedIssue> = (value: Value) => Future<NewValue, NewIssue>;

export type Transform<Value, NewValue> = (value: Value) => NewValue

export type Fork<Value> = (value: Value) => null

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

  public fork(fork: Fork<Value>): Future<Value, Issue | UnexpectedIssue> {
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

export class State<Value> {
  private observers: Array<OnValue<Value>> = [];

  constructor(private value: Value) { }

  public set(newValue: Value): void {
    this.value = newValue;
    this.notifyObservers();
  }

  public next(update: (value: Value) => Value): null {
    this.value = update(this.value);
    this.notifyObservers();

    return null;
  }

  public on(notify: OnValue<Value>): null {
    this.observers.push(notify);
    notify(this.value);

    return null;
  }

  private notifyObservers(): null {
    this.observers.forEach(observer => {
      observer(this.value);
    });

    return null;
  }
}