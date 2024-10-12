import { Facility } from "./Facility";
import { Severity } from "./Severity";


export interface SyslogOptions {
  facility: Facility;
  severity: Severity;
  hostname: string;
  application: string;
  identifier: string;
  console: Console;
}
