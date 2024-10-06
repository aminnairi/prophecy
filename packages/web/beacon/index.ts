import { Future, UnexpectedIssue } from "@prophecy/future";

export const sendBeacon = <Data extends BodyInit | undefined | null>({ navigator, data, url }: { navigator: Navigator, url: string, data?: Data }): Future<Data | undefined, UnexpectedIssue> => {
  return Future.from(onValue => {
    navigator.sendBeacon(url, data);
    return onValue(data);
  });
};

export const sendBeaconForData = ({ navigator, url }: { navigator: Navigator, url: string }) => {
  return <Data extends BodyInit | undefined | null>(data?: Data): Future<Data | undefined, UnexpectedIssue>  => {
    return Future.from(onValue => {
      navigator.sendBeacon(url, data);
      return onValue(data);
    });
  }
};