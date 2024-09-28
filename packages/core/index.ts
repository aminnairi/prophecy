import { UnexpectedIssue } from "@prophecy/issue";

export type OnIssue<Issue> = (issue: Issue) => null;

export type OnValue<Value> = (value: Value) => null;

export type Observer<Value, Issue> = (onValue: OnValue<Value>, onIssue: OnIssue<Issue>) => null;

export type Operator<Value, NewValue, NewIssue> = (value: Value) => Future<NewValue, NewIssue>;

export type Transform<Value, NewValue> = (value: Value) => NewValue

export type Fork<Value> = (value: Value) => null

export class Future<Value, Issue> {
  constructor(private readonly observer: Observer<Value, Issue>) {}

  public do<NewValue, NewIssue>(operator: Operator<Value, NewValue, NewIssue>): Future<NewValue, Issue | NewIssue | UnexpectedIssue> {
    return new Future((onValue, onIssue) => {
      try {
        return this.on({
          value: (value) => {
            const newProphecy = operator(value);

            return newProphecy.on({
              value: onValue,
              issue: onIssue
            });
          },
          issue: onIssue
        });
      } catch (error) {
        const errorNormalized = error instanceof Error ? error : new Error(String(error));
        return onIssue(new UnexpectedIssue(errorNormalized));
      }
    });
  }

  public recover<IssueKind extends Issue[typeof kind], RecoveredIssue extends Extract<Issue, { [kind]: IssueKind }>, IssueWithoutExcludedIssue extends Exclude<Issue, RecoveredIssue>, NewValue, NewIssue extends DiscriminatedIssue>(issueKind: IssueKind, update: (issue: RecoveredIssue) => Future<NewValue, NewIssue>): Future<Value | NewValue, IssueWithoutExcludedIssue | NewIssue> {
    return new Future((onValue, onIssue) => {
      this.run({
        onIssue: issue => {
          if (issue[kind] === issueKind) {
            return update(issue as unknown as RecoveredIssue).run({
              onIssue,
              onValue
            });
          }

          return onIssue(issue as unknown as IssueWithoutExcludedIssue);
        },
        onValue
      });
      return null;
    });
  }

  public fork(fork: Fork<Value>): Future<Value, Issue | UnexpectedIssue> {
    return this.do(value => {
      return new Future((onValue) => {
        fork(value);
        return onValue(value);
      });
    });
  }

  public on({ value, issue }: { value?: OnValue<Value>, issue: OnIssue<Issue> }): null {
    const ignore = () => null;
    return this.observer(value ?? ignore, issue);
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