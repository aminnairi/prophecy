import { effect, match, useFuture, when } from "@prophecy/future";
import { string } from "@prophecy/string";
import { EventKind, forEvent, forId, getInputValue, setTextContent } from "@prophecy/web/dom";

type Dependency = {
  identifier: string,
  name: string,
  version: string
}

type PackageJson = {
  name?: string,
  description?: string,
  dependencies?: Array<Dependency>
}

const [packageJson, setPackageJson] = useFuture<PackageJson>({});

forId("name")
  .and(forEvent(EventKind.Input))
  .and(getInputValue)
  .and(string.future.trim)
  .and(when(string.isEmpty, effect(() => setPackageJson(({ name, ...rest }) => rest))))
  .and(when(string.isNotEmpty, effect(name => setPackageJson(value => ({ ...value, name })))))
  .run(match({
    ElementNotFoundIssue: issue => {
      alert(`Element with identifier ${issue.identifier} not found in the current DOM.`);
    },
    ElementNotInputIssue: () => {
      alert(`Element name is not an input.`);
    },
    UnexpectedIssue: issue => {
      alert(`Unexpected issue: ${issue.error}.`);
    }
  }));

forId("description")
  .and(forEvent(EventKind.Input))
  .and(getInputValue)
  .and(string.future.trim)
  .and(when(string.isEmpty, effect(() => setPackageJson(({ description, ...rest }) => rest))))
  .and(when(string.isNotEmpty, effect(description => setPackageJson(value => ({ ...value, description })))))
  .run(match({
    ElementNotFoundIssue: issue => {
      alert(`Element with identifier ${issue.identifier} not found in the current DOM.`);
    },
    ElementNotInputIssue: () => {
      alert(`Element description is not an input.`);
    },
    UnexpectedIssue: issue => {
      alert(`Unexpected issue: ${issue.error}.`);
    }
  }));

forId("dependency-new")
  .and(forEvent(EventKind.Click))
  .and(effect(() => setPackageJson(value => ({ ...value, dependencies: [...value?.dependencies ?? [], { identifier: crypto.randomUUID(), name: "", version: "" }] }))))
  .run(match({
    ElementNotFoundIssue: issue => {
      alert(`Element with identifier ${issue.identifier} not found in the current DOM.`);
    },
    UnexpectedIssue: issue => {
      alert(`Unexpected issue: ${issue.error}.`);
    }
  }));

packageJson
  .and(value => forId("output").and(setTextContent(JSON.stringify(value, null, 2))))
  .run(match({
    ElementNotFoundIssue: issue => {
      alert(`Element with id ${issue.identifier} not found in the current DOM.`);
    },
    UnexpectedIssue: issue => {
      alert(`Unexpected error: ${issue.error}.`);
    }
  }));