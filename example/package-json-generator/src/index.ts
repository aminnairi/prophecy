import { effect, match, useFuture, when } from "@prophecy/future";
import { string } from "@prophecy/string";
import { EventKind, forEvent, forId, getInputValue, setTextContent } from "@prophecy/web/dom";

type PackageJson = {
  name?: string,
  description?: string
}

const [packageJson, setPackageJson] = useFuture<PackageJson>({});

forId("name")
  .and(forEvent(EventKind.Input))
  .and(getInputValue)
  .and(string.future.trim)
  .and(when(string.isEmpty, effect(() => setPackageJson(({ name, ...rest }) => rest))))
  .and(when(string.isNotEmpty, effect(name => setPackageJson(value => ({ ...value, name })))))
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
  .and(when(string.isEmpty, effect(() => setPackageJson(({ description, ...rest }) => rest))))
  .and(when(string.isNotEmpty, effect(description => setPackageJson(value => ({ ...value, description })))))
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

packageJson
  .and(string.future.fromJson(2))
  .and(value => forId("output").and(setTextContent(value)))
  .on({
    issue: match({
      ElementNotFoundIssue: issue => {
        alert(`Element with id ${issue.identifier} not found in the current DOM.`);
      },
      JsonSerializationIssue: issue => {
        alert(`Failed to serialize data ${issue.json}.`);
      },
      UnexpectedIssue: issue => {
        alert(`Unexpected error: ${issue.error}.`);
      }
    })
  });