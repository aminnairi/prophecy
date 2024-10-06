import { Future, DiscriminatedIssue, UnexpectedIssue, kind  } from "@prophecy/future";

/** @override */
export interface MessageEvent {
  data: unknown
}

export class EventSourceIssue implements DiscriminatedIssue {
  public readonly [kind] = "EventSourceIssue";
  public constructor(public readonly event: Event) {}
}

export type EventSourceEventHandler<Value> = (event: MessageEvent) => Value;

export const withEventSource = (url: string, options?: EventSourceInit): Future<EventSource, UnexpectedIssue | EventSourceIssue> => {
  return Future.from((onValue, onIssue) => {
    const eventSource = new EventSource(url, options);

    eventSource.addEventListener("error", error => {
      onIssue(new EventSourceIssue(error));
    });

    return onValue(eventSource);
  });
};

export const forEventSourceEvent = <Value>(eventName: string, handler: EventSourceEventHandler<Value>) => {
  return (eventSource: EventSource): Future<Value, UnexpectedIssue>  => {
    return Future.from(onValue => {
      eventSource.addEventListener(eventName, event => {
        const value = handler(event);
        onValue(value);
      });

      return null;
    });
  };
};

export const forEventSourceMessageEvent = <Value>(handler: EventSourceEventHandler<Value>) => {
  return forEventSourceEvent("message", handler);
};

export const closeEventSource = (eventSource: EventSource): Future<EventSource, UnexpectedIssue> => {
  return Future.from((onValue) => {
    eventSource.close();
    return onValue(eventSource);
  });
};