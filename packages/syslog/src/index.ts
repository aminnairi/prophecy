import { Future } from "@prophecy/future";

export enum Facility {
  Kernel = 0,
  User = 1,
  Mail = 2,
  Daemon = 3,
  Authorization = 4,
  Syslog = 5,
  Printer = 6,
  News = 7,
  UUCP = 8,
  ClockDaemon = 9,
  PrivateAuthorization = 10,
  FTP = 11,
  Local0 = 16,
  Local1 = 17,
  Local2 = 18,
  Local3 = 19,
  Local4 = 20,
  Local5 = 21,
  Local6 = 22,
  Local7 = 23
}

export enum Severity {
  Emergency = 0,
  Alert = 1,
  Critical = 2,
  Error = 3,
  Warning = 4,
  Notice = 5,
  Informational = 6,
  Debug = 7
}

export interface SyslogOptions {
  facility: Facility;
  severity: Severity;
  hostname: string;
  application: string;
  identifier: string;
}

export function log<Value>(options: SyslogOptions): (value: Value) => Future<Value>
export function log<Value>(options: SyslogOptions, value: Value): Future<Value>;
export function log<Value>({ hostname, application, identifier, facility, severity }: SyslogOptions, value?: Value): Future<Value> | ((value: Value) => Future<Value>) {
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

  if (value === undefined) {
    return (value: Value): Future<Value> => {
      return Future.of(emitValue => {
        console.log(`<${priority}>${timestamp} ${hostname} ${application}[${identifier}]: ${value}`);
        return emitValue(value);
      });
    };
  }


  return Future.of<Value>((emitValue) => {
    console.log(`<${priority}>${timestamp} ${hostname} ${application}[${identifier}]: ${value}`);
    return emitValue(value);
  });
};

export function emergency<Value>(options: Omit<SyslogOptions, "severity">): (value: Value) => Future<Value>;
export function emergency<Value>(options: Omit<SyslogOptions, "severity">, value: Value): Future<Value>;
export function emergency<Value>(options: Omit<SyslogOptions, "severity">, value?: Value): Future<Value> | ((value: Value) => Future<Value>) {
  const commonOptions = {
    ...options,
    severity: Severity.Emergency
  };

  if (value === undefined) {
    return function (value: Value): Future<Value> {
      return log<Value>(commonOptions, value);
    };
  }

  return log<Value>(commonOptions, value);
}