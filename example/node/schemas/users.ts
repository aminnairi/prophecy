import { Future } from "@prophecy/core";
import { DiscriminatedIssue, UnexpectedIssue, kind } from "@prophecy/issue";
import { ZodError, z } from "zod";

export class UserValidationIssue implements DiscriminatedIssue {
  public readonly [kind] = "UserValidationIssue";
  public constructor(public readonly zodError: ZodError) {}
}

export class JsonParseIssue implements DiscriminatedIssue {
  public readonly [kind] = "JsonParseIssue";
  public constructor(error: Error) {}
}

export const userSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string().email()
});

export const usersSchema = z.array(userSchema);

export const toUsers = (data: unknown): Future<Users, UserValidationIssue | UnexpectedIssue> => {
  return Future.from((onValue, onIssue) => {
    const validation = usersSchema.safeParse(data);

    if (validation.success) {
      return onValue(validation.data);
    }

    return onIssue(new UserValidationIssue(validation.error));
  });
}

export const toJson = (data: string): Future<unknown, JsonParseIssue | UnexpectedIssue> => {
  return Future.from((onValue, onIssue) => {
    try {
      return onValue(JSON.parse(data));
    } catch (error) {
      const normalizedError = error instanceof Error ? error : new Error(String(error));
      return onIssue(new JsonParseIssue(normalizedError));
    }
  });
}

export const toStringifiedJson = ({ pretty }: { pretty: boolean}) => (data: unknown): Future<string, UnexpectedIssue> => {
  return Future.from(onValue => {
    return onValue(JSON.stringify(data, null, pretty ? 2 : 0));
  });
};

export type Users = z.infer<typeof usersSchema>;

export type User = z.infer<typeof userSchema>;