export type OnValue<Value> = (value: Value) => null;

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