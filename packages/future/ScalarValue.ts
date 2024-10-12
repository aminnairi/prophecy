import { ScalarRecord } from "./ScalarRecord";
import { ScalarArray } from "./ScalarArray";


export type ScalarValue = string |
  number |
  boolean |
  bigint |
  symbol |
  null |
  undefined |
  ScalarArray |
  ScalarRecord;
