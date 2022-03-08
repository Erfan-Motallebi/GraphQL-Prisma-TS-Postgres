import { IContext } from "./../../index";
import { Profile, User } from "@prisma/client";

export const profileResolver = {
  Profile: {
    async user(profile: Profile, __: any, { prisma }: IContext): Promise<User> {
      return (await prisma.user.findUnique({
        where: {
          id: profile.userId,
        },
      })) as User;
    },
  },
};
