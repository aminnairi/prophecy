import { State } from "@prophecy/core";
import { kind } from "@prophecy/issue";
import { getElementById, onEvent, onText, setTextContent, EventKind } from "@prophecy/web/dom";
import { whenEmpty } from "@prophecy/string";

const numberOfKeystrokes = new State(0);

getElementById("text")
  .andThen(onEvent(EventKind.Input))
  .andThen(onText)
  .andThen(whenEmpty("John DOE"))
  .andThen(text => getElementById("output").andThen(setTextContent(`Hello, ${text}`)))
  .on({
    value: () => numberOfKeystrokes.next(value => value + 1),
    issue: issue => {
      switch (issue[kind]) {
        case "ElementNotFoundIssue":
          console.error(`Element with id ${issue.identifier} not found.`);
          return null;

        case "ElementNotInputIssue":
          console.error("Element is not an input.");
          return null;

        case "UnexpectedIssue":
          console.error(`Unexpected error: ${issue.error}`);
          return null;
      }
    }
  });

numberOfKeystrokes.on(value => {
  return getElementById("keystrokes")
    .andThen(setTextContent(`Number of keystrokes so far: ${value}`))
    .on({
      issue: issue => {
        switch (issue[kind]) {
          case "ElementNotFoundIssue":
            console.error(`Element with id ${issue.identifier} is not found in the DOM`);
            return null;

          case "UnexpectedIssue":
            console.error(`Unexpected error: ${issue.error}`);
            return null;
        }
      }
    });
});