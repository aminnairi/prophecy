import { effect, Future, match, observable, when } from "@prophecy/future";
import { State } from "@prophecy/state";
import { string } from "@prophecy/string";
import { EventKind, forEvent, forId, getInputValue, setTextContent } from "@prophecy/web/dom";

interface PackageJson {
  name?: string,
  description?: string
}

const packageJsonContent = State.from<PackageJson>({});

forId("name")
  .and(forEvent(EventKind.Input))
  .and(getInputValue)
  .and(string.future.trim)
  .and(when(string.isEmpty, effect(() => packageJsonContent.next(({ name, ...rest }) => rest))))
  .and(when(string.isNotEmpty, effect(name => packageJsonContent.next(value => ({ ...value, name })))))
  .on({
    issue: match({
      ElementNotFoundIssue: issue => {
        alert(`Element with identifier ${issue.identifier} not found in the current DOM.`);
      },
      ElementNotInputIssue: () => {
        alert(`Element name is not an input.`);
      },
      UnexpectedIssue: issue => {
        alert(`Unexpected issue: ${issue.error}.`);
      }
    })
  });

forId("description")
  .and(forEvent(EventKind.Input))
  .and(getInputValue)
  .and(string.future.trim)
  .and(when(string.isEmpty, effect(() => packageJsonContent.next(({ description, ...rest }) => rest))))
  .and(when(string.isNotEmpty, effect(description => packageJsonContent.next(value => ({ ...value, description })))))
  .on({
    issue: match({
      ElementNotFoundIssue: issue => {
        alert(`Element with identifier ${issue.identifier} not found in the current DOM.`);
      },
      ElementNotInputIssue: () => {
        alert(`Element description is not an input.`);
      },
      UnexpectedIssue: issue => {
        alert(`Unexpected issue: ${issue.error}.`);
      }
    })
  });

packageJsonContent.on(value => {
  return forId("output")
    .and(setTextContent(JSON.stringify(value, null, 2)))
    .on({
      issue: match({
        ElementNotFoundIssue: issue => {
          alert(`Element with identifier ${issue.identifier} is not found in the current DOM.`);
        },
        UnexpectedIssue: issue => {
          alert(`Unexpected issue: ${issue.error}.`);
        }
      })
    });
});