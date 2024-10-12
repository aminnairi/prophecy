import { Future } from ".";
import { DiscriminatedIssue } from "./DiscriminatedIssue";


export type Update<Value, NewValue, NewIssue extends DiscriminatedIssue> = (value: Value) => Future<NewValue, NewIssue>;
