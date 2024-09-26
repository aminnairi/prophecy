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

export const withUsers = (data: unknown): Future<Users, UserValidationIssue | UnexpectedIssue> => {
  return new Future((onValue, onIssue) => {
    const validation = usersSchema.safeParse(data);

    if (validation.success) {
      return onValue(validation.data);
    }

    return onIssue(new UserValidationIssue(validation.error));
  });
}

export const toJson = (data: string): Future<unknown, JsonParseIssue | UnexpectedIssue> => {
  return new Future((onValue, onIssue) => {
    try {
      return onValue(JSON.parse(data));
    } catch (error) {
      return onIssue(new JsonParseIssue(error));
    }
  });
}

export const toStringifiedJson = ({ pretty }: { pretty: boolean}) => (data: unknown): Future<string, UnexpectedIssue> => {
  return new Future(onValue => {
    return onValue(JSON.stringify(data, null, pretty ? 2 : 0));
  });
};

export type Users = z.infer<typeof usersSchema>;

export type User = z.infer<typeof userSchema>;