import { Future } from "@prophecy/future";
import { SyslogOptions } from "./SyslogOptions";

export const syslog = <Value>({ hostname, application, identifier, facility, severity, console }: SyslogOptions) => {
  return (future: Future<Value>) => {
    return future.parallel(value => {
      const priority = facility * 8 + severity;
      const today = new Date();
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const month = months[today.getMonth()];
      const date = today.getDate();
      const hours = String(today.getHours()).padStart(2, '0');
      const minutes = String(today.getMinutes()).padStart(2, '0');
      const seconds = String(today.getSeconds()).padStart(2, '0');
      const day = (date < 10 ? ' ' : '') + date;
      const timestamp = `${month} ${day} ${hours}:${minutes}:${seconds}`;

      console.log(`<${priority}>${timestamp} ${hostname} ${application}[${identifier}]: ${value}`);

      return null;
    });
  }
};