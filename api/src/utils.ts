import { verify } from "jsonwebtoken";

import { Context } from "./context";

export const APP_SECRET = String(process.env.APP_SECRET);

interface Token {
  userId: string;
}

export function getUserId(context: Context) {
  const authHeader = context.req.get("Authorization");
  if (authHeader) {
    const token = authHeader.replace("Bearer ", "");
    const verifiedToken = verify(token, APP_SECRET) as Token;
    return verifiedToken && Number(verifiedToken.userId);
  }
}

export function findUser(email: string, context: Context) {
  return context.prisma.user.findUnique({
    where: { email },
  });
}