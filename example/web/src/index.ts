import { State } from "@prophecy/core";
import { match } from "@prophecy/issue";
import { forId, forEvent, getInputValue, setTextContent, EventKind } from "@prophecy/web/dom";
import { whenEmpty } from "@prophecy/string";

const numberOfKeystrokes = new State(0);

forId("text")
  .and(forEvent(EventKind.Input))
  .and(getInputValue)
  .and(whenEmpty("John DOE"))
  .and(text => forId("output").and(setTextContent(`Hello, ${text}`)))
  .fork(() => numberOfKeystrokes.next(value => value + 1))
  .run(match({
    ElementNotFoundIssue: issue => console.error(`Element with id ${issue.identifier} not found.`),
    ElementNotInputIssue: () => console.error("Element is not an input."),
    UnexpectedIssue: issue => console.error(`Unexpected error: ${issue.error}`),
  }));

numberOfKeystrokes.on(value => {
  return forId("keystrokes")
    .and(setTextContent(`Number of keystrokes so far: ${value}`))
    .run(match({
      ElementNotFoundIssue: issue => console.error(`Element with id ${issue.identifier} is not found in the DOM`),
      UnexpectedIssue: issue => console.error(`Unexpected error: ${issue.error}`),
    }));
});