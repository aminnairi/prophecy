import { Future } from "@prophecy/core";
import { UnexpectedIssue } from "@prophecy/issue";

export const sendBeacon = <Data extends BodyInit | undefined | null>({ navigator, data, url }: { navigator: Navigator, url: string, data?: Data }): Future<Data | undefined, UnexpectedIssue> => {
  return new Future(onValue => {
    navigator.sendBeacon(url, data);
    return onValue(data);
  });
};

export const sendBeaconForData = ({ navigator, url }: { navigator: Navigator, url: string }) => {
  return <Data extends BodyInit | undefined | null>(data?: Data): Future<Data | undefined, UnexpectedIssue>  => {
    return new Future(onValue => {
      navigator.sendBeacon(url, data);
      return onValue(data);
    });
  }
};