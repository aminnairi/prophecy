import { DiscriminatedIssue, Future, kind } from "@prophecy/future";

export class StringCharacterIndexNotFoundIssue implements DiscriminatedIssue {
  public readonly [kind] = "StringCharacterIndexNotFoundIssue";
  public constructor(public readonly string: string, public readonly index: number) {}
}

export class StringEndsWithIssue implements DiscriminatedIssue {
  public readonly [kind] = "StringEndsWithIssue";
  public constructor(public readonly string: string, public readonly end: string) {}
}

export const stringFilledOr = (fallback: string) => {
  return (text: string): Future<string> => {
    return Future.of(onValue => {
      if (text.trim().length === 0) {
        return onValue(fallback);
      }

      return onValue(text);
    });
  };
};

export const whenEmpty = (fallback: string) => (text: string): Future<string> => {
  return Future.of(onValue => {
    return onValue(text.trim().length === 0 ? fallback : text);
  });
};

export const asString = (data: unknown): Future<string> => {
  return Future.of(onValue => {
    return onValue(String(data));
  });
};

export const characterAtIndexForString = ({ string, index }: { string: string, index: number }) => {
  return Future.of<string, StringCharacterIndexNotFoundIssue>((emitValue, emitIssue) => {
    const character = string.at(index);

    if (character === undefined) {
      return emitIssue(new StringCharacterIndexNotFoundIssue(string, index));
    }

    return emitValue(character);
  });
};

export const characterAtIndex = (index: number) => {
  return (string: string) => {
    return Future.of<string, StringCharacterIndexNotFoundIssue>((emitValue, emitIssue) => {
      const character = string.at(index);

      if (character === undefined) {
        return emitIssue(new StringCharacterIndexNotFoundIssue(string, index));
      }

      return emitValue(character);
    });
  };
};

export const endsWithForString = ({ string, end }: { string: string, end: string }) => {
  return Future.of<string, StringEndsWithIssue>((emitValue, emitIssue) => {
    if (string.endsWith(end)) {
      return emitValue(string);
    }

    return emitIssue(new StringEndsWithIssue(string, end));
  });
};

export const endsWith = (end: string) => {
  return (string: string) => {
    return Future.of<string, StringEndsWithIssue>((emitValue, emitIssue) => {
      if (string.endsWith(end)) {
        return emitValue(string);
      }

      return emitIssue(new StringEndsWithIssue(string, end));
    });
  };
};

export const trimString = (string: string) => {
  return Future.of<string>((emitValue) => {
    return emitValue(string.trim());
  });
};