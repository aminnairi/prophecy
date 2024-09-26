import { UnexpectedIssue } from "@prophecy/issue";

export type OnIssue<Issue> = (issue: Issue) => null;

export type OnValue<Value> = (value: Value) => null;

export type Observer<Value, Issue> = (onValue: OnValue<Value>, onIssue: OnIssue<Issue>) => null;

export type Operator<Value, NewValue, NewIssue> = (value: Value) => Future<NewValue, NewIssue>;

export type Transform<Value, NewValue> = (value: Value) => NewValue

export class Future<Value, Issue> {
  constructor(private readonly observer: Observer<Value, Issue>) {}

  public and<NewValue>(transform: Transform<Value, NewValue>): Future<NewValue, Issue | UnexpectedIssue> {
    return new Future((onValue, onIssue) => {
      try {
        return this.on({
          value: value => {
            return onValue(transform(value));
          },
          issue: onIssue
        });
      } catch (error) {
        const errorNormalized = error instanceof Error ? error : new Error(String(error));
        return onIssue(new UnexpectedIssue(errorNormalized));
      }
    });
  }

  public andThen<NewValue, NewIssue>(operator: Operator<Value, NewValue, NewIssue>): Future<NewValue, Issue | NewIssue | UnexpectedIssue> {
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

  public updateError<NewIssue>(updateIssue: (issue: Issue) => NewIssue): Future<Value, NewIssue | UnexpectedIssue> {
    return new Future((onValue, onIssue) => {
      try {
        return this.on({
          value: value => {
            return onValue(value);
          },
          issue: issue => {
            return onIssue(updateIssue(issue));
          }
        });
      } catch (error) {
        const errorNormalized = error instanceof Error ? error : new Error(String(error));
        return onIssue(new UnexpectedIssue(errorNormalized));
      }
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
