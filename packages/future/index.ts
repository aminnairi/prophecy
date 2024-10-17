import { State } from "@prophecy/state";

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

export function match<Issue extends DiscriminatedIssue>(patterns: { [Key in Issue[typeof kind]]: (issue: Extract<Issue, { [kind]: Key; }>) => unknown; }) {
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
  private constructor(private readonly observer: Start<Value, Issue>) {}

  public static of<Value = never, Issue extends DiscriminatedIssue = UnexpectedIssue>(start: Start<Value, Issue>): Future<Value, Issue | UnexpectedIssue> {
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
        this.run(
          emitIssue,
          value => {
            update(value).run(
              emitIssue,
              emitValue,
            );

            return null;
          }
        );

        return null;
      } catch (error) {
        const errorNormalized = error instanceof Error ? error : new Error(String(error));
        return emitIssue(new UnexpectedIssue(errorNormalized));
      }
    });
  }

  public recover<IssueKind extends Issue[typeof kind], RecoveredIssue extends Extract<Issue, { [kind]: IssueKind }>, IssueWithoutExcludedIssue extends Exclude<Issue, RecoveredIssue>, NewValue, NewIssue extends DiscriminatedIssue>(issue: IssueKind, remediation: (issue: RecoveredIssue) => Future<NewValue, NewIssue>): Future<Value | NewValue, IssueWithoutExcludedIssue | NewIssue> {
    return new Future((emitValue, emitIssue) => {
      this.run(
        nextIssue => {
          if (nextIssue[kind] === issue) {
            remediation(nextIssue as unknown as RecoveredIssue).run(
              emitIssue,
              emitValue
            );

            return null;
          }

          return emitIssue(nextIssue as unknown as IssueWithoutExcludedIssue);
        },
        emitValue
      );
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

  public run(issue: OnIssue<Issue>): null;
  public run(issue: OnIssue<Issue>, value: OnValue<Value>): null;
  public run(onIssue: OnIssue<Issue>, onValue?: OnValue<Value>): null {
    if (onValue === undefined) {
      return this.observer(() => null, onIssue);
    }

    return this.observer(onValue, onIssue);
  }
}

export type Condition<Value> = (value: Value) => boolean

export const when = <GenericValue, GenericIssue extends DiscriminatedIssue>(accept: Condition<GenericValue>, update: Update<GenericValue, GenericValue, GenericIssue | UnexpectedIssue>): Update<GenericValue, GenericValue, GenericIssue | UnexpectedIssue> => {
  return (value: GenericValue) => {
    return Future.from<GenericValue, GenericIssue | UnexpectedIssue>((emitValue, emitIssue) => {
      if (accept(value)) {
        update(value).on({
          value: emitValue,
          issue: emitIssue
        });

        return null;
      }

      return emitValue(value);
    });
  };
};

export type Action<Value> = (value: Value) => void;

export const effect = <GenericValue, GenericIssue extends DiscriminatedIssue>(action: Action<GenericValue>): Update<GenericValue, GenericValue, GenericIssue | UnexpectedIssue> => {
  return (value: GenericValue) => {
    action(value);

    return Future.from<GenericValue, GenericIssue>((emitValue) => {
      return emitValue(value);
    });
  };
};

export const useFuture = <Value extends ScalarValue>(initialValue: Value): [Future<Value, UnexpectedIssue>, (update: (value: Value) => Value) => void] => {
  const state = State.from(initialValue);

  const future = Future.from<Value>((emitValue) => {
    state.on(value => {
      return emitValue(value);
    })

    return null;
  });

  const emitValue = (update: (value: Value) => Value) => {
    state.next(update);
  };

  return [future, emitValue];
};
