import { State } from "@prophecy/core";
import { match } from "@prophecy/issue";
import { forId, forEvent, withInputText, setTextContent, EventKind } from "@prophecy/web/dom";
import { whenEmpty } from "@prophecy/string";

const numberOfKeystrokes = new State(0);

forId("text")
  .do(forEvent(EventKind.Input))
  .do(withInputText)
  .do(whenEmpty("John DOE"))
  .do(text => forId("output").do(setTextContent(`Hello, ${text}`)))
  .fork(() => numberOfKeystrokes.next(value => value + 1))
  .on({
    issue: match({
      ElementNotFoundIssue: issue => console.error(`Element with id ${issue.identifier} not found.`),
      ElementNotInputIssue: () => console.error("Element is not an input."),
      UnexpectedIssue: issue => console.error(`Unexpected error: ${issue.error}`),
    })
  });

numberOfKeystrokes.on(value => {
  return forId("keystrokes")
    .do(setTextContent(`Number of keystrokes so far: ${value}`))
    .on({
      issue: match({
        ElementNotFoundIssue: issue => console.error(`Element with id ${issue.identifier} is not found in the DOM`),
        UnexpectedIssue: issue => console.error(`Unexpected error: ${issue.error}`),
      })
    });
});