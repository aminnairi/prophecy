import { Future } from "@prophecy/future";

export const sendBeacon = <Data extends BodyInit | undefined | null>({ navigator, data, url }: { navigator: Navigator, url: string, data?: Data }) => {
  return Future.from<Data | undefined>(onValue => {
    navigator.sendBeacon(url, data);
    return onValue(data);
  });
};

export const sendBeaconForData = ({ navigator, url }: { navigator: Navigator, url: string }) => {
  return <Data extends BodyInit | undefined | null>(data?: Data) => {
    return Future.from<Data | undefined>(onValue => {
      navigator.sendBeacon(url, data);
      return onValue(data);
    });
  }
};