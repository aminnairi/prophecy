import { DiscriminatedIssue, Future, kind  } from "@prophecy/future";
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

export const toUsers = (data: unknown) => {
  return Future.of<Users, UserValidationIssue>((onValue, onIssue) => {
    const validation = usersSchema.safeParse(data);

    if (validation.success) {
      return onValue(validation.data);
    }

    return onIssue(new UserValidationIssue(validation.error));
  });
}

export const toJson = (data: string) => {
  return Future.of<unknown, JsonParseIssue>((onValue, onIssue) => {
    try {
      return onValue(JSON.parse(data));
    } catch (error) {
      const normalizedError = error instanceof Error ? error : new Error(String(error));
      return onIssue(new JsonParseIssue(normalizedError));
    }
  });
}

export const toStringifiedJson = ({ pretty }: { pretty: boolean}) => (data: unknown) => {
  return Future.of<string>(onValue => {
    return onValue(JSON.stringify(data, null, pretty ? 2 : 0));
  });
};

export type Users = z.infer<typeof usersSchema>;

export type User = z.infer<typeof userSchema>;