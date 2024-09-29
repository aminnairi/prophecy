import { DiscriminatedIssue, UnexpectedIssue, kind } from "@prophecy/issue";

export type OnIssue<Issue> = (issue: Issue) => null;

export type OnValue<Value> = (value: Value) => null;

export type Observer<Value, Issue> = (onValue: OnValue<Value>, onIssue: OnIssue<Issue>) => null;

export type Update<Value, NewValue, NewIssue extends DiscriminatedIssue> = (value: Value) => Future<NewValue, NewIssue>;

export type Transform<Value, NewValue> = (value: Value) => NewValue

export type Fork<Value> = (value: Value) => null

export class Future<Value, Issue extends DiscriminatedIssue> {
  private constructor(private readonly observer: Observer<Value, Issue>) { }

  public static from<Value, Issue extends DiscriminatedIssue>(start: Observer<Value, Issue>): Future<Value, Issue | UnexpectedIssue> {
    return new Future<Value, Issue | UnexpectedIssue>((onValue, onIssue) => {
      try {
        return start(onValue, onIssue);
      } catch (error) {
        const unexpectedIssue = error instanceof Error ? new UnexpectedIssue(error) : new UnexpectedIssue(new Error(String(error)));
        return onIssue(unexpectedIssue);
      }
    });
  }

  public and<NewValue, NewIssue extends DiscriminatedIssue>(update: Update<Value, NewValue, NewIssue>): Future<NewValue, Issue | NewIssue | UnexpectedIssue> {
    return new Future((onValue, onIssue) => {
      try {
        return this.run({
          onIssue: onIssue,
          onValue: value => update(value).run({
            onIssue,
            onValue,
          })
        });
      } catch (error) {
        const errorNormalized = error instanceof Error ? error : new Error(String(error));
        return onIssue(new UnexpectedIssue(errorNormalized));
      }
    });
  }

  public recover<IssueKind extends Issue[typeof kind], RecoveredIssue extends Extract<Issue, { [kind]: IssueKind }>, IssueWithoutExcludedIssue extends Exclude<Issue, RecoveredIssue>, NewValue, NewIssue extends DiscriminatedIssue>({ issue, remediation }: { issue: IssueKind, remediation: (issue: RecoveredIssue) => Future<NewValue, NewIssue> }): Future<Value | NewValue, IssueWithoutExcludedIssue | NewIssue> {
    return new Future((onValue, onIssue) => {
      this.run({
        onIssue: nextIssue => {
          if (nextIssue[kind] === issue) {
            return remediation(nextIssue as unknown as RecoveredIssue).run({
              onIssue,
              onValue
            });
          }

          return onIssue(nextIssue as unknown as IssueWithoutExcludedIssue);
        },
        onValue
      });
      return null;
    });
  }

  public fork(fork: Fork<Value>): Future<Value, Issue | UnexpectedIssue> {
    return this.and(value => {
      return new Future((onValue) => {
        fork(value);
        return onValue(value);
      });
    });
  }

  public run({ onIssue, onValue = () => null }: { onIssue: OnIssue<Issue>, onValue?: OnValue<Value> }): null {
    return this.observer(onValue, onIssue);
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