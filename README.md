# @prophecy/core

Shape your future, leave uncertainty behind

## Example

```typescript
getElementById("text").and(onEvent("input")).and(onText).on({
  value: text => {
    console.log(`Typed ${text}`);
    return null;
  },
  issue: issue => {
    switch (issue[kind]) {
      case "ElementNotFoundIssue":
        console.error("Element not found.");
        return null;

      case "ElementNotInputIssue":
        console.error("Element is not an input.");
        return null;
    }
  }
});
```