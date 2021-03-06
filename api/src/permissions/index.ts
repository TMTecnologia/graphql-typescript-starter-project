import { AuthenticationError, UserInputError } from "apollo-server";
import { compare } from "bcryptjs";
import { allow, rule, shield } from "graphql-shield";

import { Context } from "../context";
import { getUserId, findUser } from "../utils";

const rules = {
  isAuthenticatedUser: rule()((_parent, _args, context: Context) => {
    const userId = getUserId(context);
    return Boolean(userId);
  }),
  userAlreadyExists: rule()(async (_parent, args, context: Context) => {
    const user = Boolean(await findUser(args.data.email, context));
    return !user || new UserInputError(`User already found for email: ${args.data.email}`);
  }),
  userNotFound: rule()(async (_parent, args, context: Context) => {
    const user = Boolean(await findUser(args.data.email, context));
    return user || new AuthenticationError(`No user found for email: ${args.data.email}`);
  }),
  invalidPassword: rule()(async (_parent, args, context: Context) => {
    const user = await findUser(args.data.email, context);
    const passwordValid = await compare(args.data.password, user?.password ?? "");
    return passwordValid || new AuthenticationError("Invalid password");
  }),
};

export const permissions = shield(
  {
    Query: {
      "*": allow,
      allUsers: allow,
      whoami: rules.isAuthenticatedUser,
    },
    Mutation: {
      "*": allow,
      createUser: rules.userAlreadyExists,
    },
  },
  {
    fallbackRule: allow,
    // allowExternalErrors: true, // NOTE: when debugging enable this
  }
);
