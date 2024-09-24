import { kind } from "@prophecy/issue";
import { getElementById, onEvent, onText, setTextContent } from "@prophecy/web";

getElementById("text").andThen(onEvent("input")).andThen(onText).and(text => {
  if (text.trim().length === 0) {
    return "John DOE";
  }

  return text;
}).andThen(text => {
  return getElementById("output").andThen(setTextContent(`Hello, ${text}`));
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