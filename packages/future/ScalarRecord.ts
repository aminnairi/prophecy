import { ScalarValue } from "./ScalarValue";


export type ScalarRecord = {
  [key: string | number | symbol]: ScalarValue;
};
