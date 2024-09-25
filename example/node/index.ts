import { kind } from "@prophecy/issue";
import { getBufferFromFile, isFileAccessible } from "@prophecy/node";

isFileAccessible("package.json").andThen(getBufferFromFile).and(String).on({
  value: fileContent => {
    console.log(`File content: ${fileContent}`);
    return null;
  },
  issue: issue => {
    switch (issue[kind]) {
      case "GetBufferFromFileIssue":
        console.error(`Error while opening file package.json (${issue.message})`);
        return null;

      case "IsFileAccessibleIssue":
        console.error("File package.json is not accessible.");
        return null;
    }
  }
});