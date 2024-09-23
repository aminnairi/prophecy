export const kind = Symbol("DiscriminatedIssueKind");

export interface DiscriminatedIssue {
  [kind]: string
}

type OnIssue<Issue> = (issue: Issue) => null;

type OnValue<Value> = (value: Value) => null;

type Observer<Value, Issue> = (onValue: OnValue<Value>, onIssue: OnIssue<Issue>) => null;

type Operator<Value, NewValue, NewIssue> = (value: Value) => Prophecy<NewValue, NewIssue>;

export class Prophecy<Value, Issue> {
  constructor(private readonly observer: Observer<Value, Issue>) {}

  public and<NewValue, NewIssue>(update: Operator<Value, NewValue, NewIssue>): Prophecy<NewValue, Issue | NewIssue> {
    return new Prophecy((onValue, onIssue) => {
      this.on({
        value: (value) => {
          const newObservable = update(value);

          newObservable.on({
            value: onValue,
            issue: onIssue
          });

          return null;
        },
        issue: onIssue
      });

      return null;
    });
  }

  public on({ value, issue }: { value: OnValue<Value>, issue: OnIssue<Issue> }): null {
    return this.observer(value, issue);
  }

  public onIssue(onIssue: OnIssue<Issue>): null {
    return this.observer(() => null, onIssue);
  }
}

export const map = <Value, NewValue, Issue>(update: (value: Value) => NewValue) => {
  return (prophecy: Prophecy<Value, Issue>): Prophecy<NewValue, Issue> => {
    return prophecy.and((value) => {
      return new Prophecy((onValue) => {
        return onValue(update(value));
      });
    });
  };
};