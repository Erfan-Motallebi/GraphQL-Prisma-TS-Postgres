import { IContext } from "./../index";
import Bcrypt, { genSalt } from "bcrypt";
import { promisify } from "node:util";
import { User } from "@prisma/client";

const asyncHash = promisify(Bcrypt.hash);

interface IPassGenerator {
  password: string;
  user?: User;
}

export const passwordGenerator = async (
  hashArg: IPassGenerator
): Promise<string> => {
  const { password } = hashArg;
  const salt = await genSalt(10);
  const hashedPassword = await asyncHash(password, salt);
  return hashedPassword;
};

export const passwordConfirmation = async (
  { password, user }: IPassGenerator,
  { prisma }: IContext
): Promise<boolean> => {
  return await Bcrypt.compare(password, user!.password);
};
