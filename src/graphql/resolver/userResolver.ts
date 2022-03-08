import { Profile, User } from "@prisma/client";
import { IContext } from "../..";
import { inputValidation } from "../../utils/inputValidation";
import {
  passwordConfirmation,
  passwordGenerator,
} from "../../utils/passwordGenerator";
import { tokenService } from "../../utils/tokenService";

export interface IUserPayload {
  userError: { message: string }[];
  token: string | null;
}

export interface IUserRegArgs {
  userArgs: {
    email: string;
    name?: string;
    password: string;
    bio: string;
  };
}

export interface IUserSignArgs {
  userArgs: {
    email: string;
    password: string;
    confirmPassword: string;
  };
}

type ProfileType = Profile;

export const userResolver = {
  UserMeUnion: {
    __resolveType(object: any, __: IContext, ___: any) {
      if (object.email) return "User";
      if (object.message) return "UserError";
    },
  },
  Profile: {
    async user(profile: Profile, __: any, { prisma }: IContext): Promise<User> {
      return (await prisma.user.findUnique({
        where: {
          id: profile.userId,
        },
      })) as User;
    },
  },
  Query: {
    userMe: async (
      _: any,
      { userId }: { userId: string },
      { prisma }: IContext
    ) => {
      const user = await prisma.user.findUnique({
        where: {
          id: Number(userId),
        },
      });

      if (!user) {
        return { message: "User not Found" };
      }

      return user;
    },
    profile: async (
      _: any,
      { userId }: { userId: string },
      { prisma }: IContext
    ): Promise<ProfileType | string> => {
      if (!userId) {
        return "userId not found";
      }

      return (await prisma.profile.findUnique({
        where: {
          id: parseFloat(userId),
        },
      })) as ProfileType;
    },
  },

  Mutation: {
    userRegistration: async (
      _: any,
      args: IUserRegArgs,
      { prisma }: IContext
    ): Promise<IUserPayload> => {
      const { password, email, name, bio } = args["userArgs"];
      try {
        /**
         * @description Validating the user parameters sent by the HTTP Request
         */
        await inputValidation.userRegistrationValidation(args["userArgs"]);

        /**
         * @description Converting the regular password into a hashed password [Security Reason]
         * @constant {string} hashedPassword
         */
        const hashedPassword = await passwordGenerator({ password });

        /**
         * @description Creating the user account/profile using the parameters
         */

        let userExisted = await prisma.user.findUnique({
          where: {
            email,
          },
        });

        if (userExisted) {
          return {
            userError: [
              {
                message: "User already existed. please try another credentials",
              },
            ],
            token: null,
          };
        }

        let newUser = await prisma.user.create({
          data: {
            email,
            name,
            password: hashedPassword,
          },
        });

        const userProfile = await prisma.profile.create({
          data: {
            bio,
            userId: newUser.id,
          },
        });

        /**
         * @description Generating the token after creating the user sections[account,profile]
         */

        const userToken = (await tokenService.userAuthTokenGen({
          email,
          userId: newUser.id,
        })) as string;
        return {
          userError: [],
          token: userToken,
        };
      } catch (error: any) {
        return error;
      }
    },

    userSignIn: async (
      _: any,
      args: IUserSignArgs,
      { prisma, req }: IContext
    ): Promise<IUserPayload> => {
      try {
        const { email, password } = args["userArgs"];

        await inputValidation.userSigninValidation(args);

        /**
         * @description Checking the availibility of the user in userRepo using Password Hash Decryption
         */

        const user = (await prisma.user.findUnique({
          where: {
            email,
          },
        })) as User;

        if (!user) {
          return {
            userError: [{ message: "User not found!" }],
            token: null,
          };
        }

        const isMatchedPass = await passwordConfirmation(
          { password, user },
          { prisma, req }
        );
        if (!isMatchedPass) {
          return {
            userError: [{ message: "Wrong Credential. please try again" }],
            token: null,
          };
        }
        const userToken = (await tokenService.userAuthTokenGen({
          email,
          userId: user.id,
        })) as string;

        return {
          userError: [],
          token: userToken,
        };
      } catch (error: any) {
        return error;
      }
    },
  },
};
