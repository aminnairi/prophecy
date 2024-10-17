import { DiscriminatedIssue, Future, kind, UnexpectedIssue } from "@prophecy/future";

export class StringCharacterIndexNotFoundIssue implements DiscriminatedIssue {
  public readonly [kind] = "StringCharacterIndexNotFoundIssue";
  public constructor(public readonly string: string, public readonly index: number) {}
}

export class StringEndsWithIssue implements DiscriminatedIssue {
  public readonly [kind] = "StringEndsWithIssue";
  public constructor(public readonly string: string, public readonly end: string) {}
}

export class JsonSerializationIssue implements DiscriminatedIssue {
  public readonly [kind] = "JsonSerializationIssue";
  public constructor(public readonly json: unknown) {}
}

export function filledOr(fallback: string) {
  return (text: string): Future<string> => {
    return Future.of(onValue => {
      if (text.trim().length === 0) {
        return onValue(fallback);
      }

      return onValue(text);
    });
  };
};

export function whenEmpty(fallback: string, string: string): Future<string>;
export function whenEmpty(fallback: string): (string: string) => Future<string>;
export function whenEmpty(fallback: string, string?: string): Future<string> | ((string: string) => Future<string>) {
  function perform(fallback: string, string: string): Future<string> {
    return Future.of(onValue => {
      return onValue(string.trim().length === 0 ? fallback : string);
    });
  }

  if (string === undefined) {
    return function(string: string) {
      return perform(fallback, string);
    }
  }

  return perform(fallback, string);
};

export function toString(data: unknown): Future<string> {
  return Future.of(onValue => {
    return onValue(String(data));
  });
};

export function atIndex(index: number, string: string): Future<string, StringCharacterIndexNotFoundIssue>
export function atIndex(index: number): (string: string) => Future<string, StringCharacterIndexNotFoundIssue>
export function atIndex(index: number, string?: string) {
  if (string === undefined) {
    return function(string: string) {
      return Future.of<string, StringCharacterIndexNotFoundIssue>((emitValue, emitIssue) => {
        const character = string.at(index);

        if (character === undefined) {
          return emitIssue(new StringCharacterIndexNotFoundIssue(string, index));
        }

        return emitValue(character);
      });
    }
  }

  return Future.of<string, StringCharacterIndexNotFoundIssue>((emitValue, emitIssue) => {
    const character = string.at(index);

    if (character === undefined) {
      return emitIssue(new StringCharacterIndexNotFoundIssue(string, index));
    }

    return emitValue(character);
  });
};

export function endsWith(end: string, string: string): Future<string, StringEndsWithIssue>;
export function endsWith(end: string): (string: string) => Future<string, StringEndsWithIssue>;
export function endsWith(end: string, string?: string) {
  function perform(end: string, string: string) {
    return Future.of<string, StringEndsWithIssue>((emitValue, emitIssue) => {
      if (string.endsWith(end)) {
        return emitValue(string);
      }

      return emitIssue(new StringEndsWithIssue(string, end));
    });
  }

  if (string === undefined) {
    return function(string: string) {
      return perform(end, string);
    }
  }
  
  return perform(end, string);
};

export function trim(string: string) {
  return Future.of<string>((emitValue) => {
    return emitValue(string.trim());
  });
};