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

export const filledOr = (fallback: string) => {
  return (text: string): Future<string> => {
    return Future.from(onValue => {
      if (text.trim().length === 0) {
        return onValue(fallback);
      }

      return onValue(text);
    });
  };
};

export const whenEmpty = (fallback: string) => (text: string): Future<string> => {
  return Future.from(onValue => {
    return onValue(text.trim().length === 0 ? fallback : text);
  });
};

export const toString = (data: unknown): Future<string> => {
  return Future.from(onValue => {
    return onValue(String(data));
  });
};

export const atIndexFor = ({ string, index }: { string: string, index: number }) => {
  return Future.from<string, StringCharacterIndexNotFoundIssue>((emitValue, emitIssue) => {
    const character = string.at(index);

    if (character === undefined) {
      return emitIssue(new StringCharacterIndexNotFoundIssue(string, index));
    }

    return emitValue(character);
  });
};

export const atIndex = (index: number) => {
  return (string: string) => {
    return Future.from<string, StringCharacterIndexNotFoundIssue>((emitValue, emitIssue) => {
      const character = string.at(index);

      if (character === undefined) {
        return emitIssue(new StringCharacterIndexNotFoundIssue(string, index));
      }

      return emitValue(character);
    });
  };
};

export const endsWithFor = ({ string, end }: { string: string, end: string }) => {
  return Future.from<string, StringEndsWithIssue>((emitValue, emitIssue) => {
    if (string.endsWith(end)) {
      return emitValue(string);
    }

    return emitIssue(new StringEndsWithIssue(string, end));
  });
};

export const endsWith = (end: string) => {
  return (string: string) => {
    return Future.from<string, StringEndsWithIssue>((emitValue, emitIssue) => {
      if (string.endsWith(end)) {
        return emitValue(string);
      }

      return emitIssue(new StringEndsWithIssue(string, end));
    });
  };
};

export const trim = (string: string) => {
  return Future.from<string>((emitValue) => {
    return emitValue(string.trim());
  });
};

export const fromJson = (indentation: number = 0) => {
  return (input: unknown): Future<string, JsonSerializationIssue | UnexpectedIssue> => {
    return Future.from((emitValue, emitIssue) => {
      try {
        return emitValue(JSON.stringify(input, null, indentation));
      } catch (error) {
        if (error instanceof SyntaxError) {
          return emitIssue(new JsonSerializationIssue(input));
        }

        throw error;
      }
    });
  };
};