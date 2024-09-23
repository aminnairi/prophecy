import { DiscriminatedIssue, Prophecy, kind, map } from "./prophecy";

export class ElementNotFoundIssue implements DiscriminatedIssue {
  public readonly [kind] = "ElementNotFoundIssue";
}

export class ElementNotInputIssue implements DiscriminatedIssue {
  public readonly [kind] = "ElementNotInputIssue";
}

export const getElementById = (identifier: string): Prophecy<HTMLElement, ElementNotFoundIssue> => {
  return new Prophecy((onValue, onIssue) => {
    const element = document.getElementById(identifier);

    if (element === null) {
      return onIssue(new ElementNotFoundIssue);
    }

    return onValue(element);
  });
};

export const onEvent = (eventName: string) => (element: HTMLElement): Prophecy<Event, never> => {
  return new Prophecy((onValue) => {
    element.addEventListener(eventName, (event) => {
      onValue(event);
    });

    return null;
  });
};

export const onText = (event: Event): Prophecy<string, ElementNotInputIssue> => {
  return new Prophecy((onValue, onIssue) => {
    if (event.target instanceof HTMLInputElement) {
      return onValue(event.target.value);
    }

    return onIssue(new ElementNotInputIssue);
  });
};

export const setTextContent = (textContent: string) => (element: HTMLElement): Prophecy<HTMLElement, never> => {
  return new Prophecy((onValue) => {
    element.textContent = textContent;

    return onValue(element);
  });
};

getElementById("text").and(onEvent("input")).and(onText).and(text => {
  return getElementById("output").and(setTextContent(`Hello, ${text}`));
}).onIssue(issue => {
  switch (issue[kind]) {
    case "ElementNotFoundIssue":
      console.error("Element not found.");
      return null;

    case "ElementNotInputIssue":
      console.error("Element is not an input.");
      return null;
  }
});