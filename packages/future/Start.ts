import { OnIssue } from "./OnIssue";
import { OnValue } from "./OnValue";


export type Start<Value, Issue> = (emitValue: OnValue<Value>, emitIssue: OnIssue<Issue>) => null;
