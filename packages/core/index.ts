type OnIssue<Issue> = (issue: Issue) => null;

type OnValue<Value> = (value: Value) => null;

type Observer<Value, Issue> = (onValue: OnValue<Value>, onIssue: OnIssue<Issue>) => null;

type Operator<Value, NewValue, NewIssue> = (value: Value) => Prophecy<NewValue, NewIssue>;

type Transform<Value, NewValue> = (value: Value) => NewValue

export class Prophecy<Value, Issue> {
  constructor(private readonly observer: Observer<Value, Issue>) {}

  public and<NewValue>(transform: Transform<Value, NewValue>): Prophecy<NewValue, Issue> {
    return new Prophecy((onValue, onIssue) => {
      return this.on({
        value: value => {
          return onValue(transform(value));
        },
        issue: onIssue
      });
    });
  }

  public andThen<NewValue, NewIssue>(operator: Operator<Value, NewValue, NewIssue>): Prophecy<NewValue, Issue | NewIssue> {
    return new Prophecy((onValue, onIssue) => {
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
    });
  }

  public updateError<NewIssue>(updateIssue: (issue: Issue) => NewIssue): Prophecy<Value, NewIssue> {
    return new Prophecy((onValue, onIssue) => {
      return this.on({
        value: value => {
          return onValue(value);
        },
        issue: issue => {
          return onIssue(updateIssue(issue));
        }
      });
    });
  }

  public on({ value, issue }: { value: OnValue<Value>, issue: OnIssue<Issue> }): null {
    return this.observer(value, issue);
  }

  public onIssue(onIssue: OnIssue<Issue>): null {
    return this.observer(() => null, onIssue);
  }
}