import { User } from "@prisma/client";
import dataLoader from "dataloader";
import { prisma } from "./../../index";

type BatchUserType = (userIds: number[]) => Promise<User[]>;

export const batchUsers: BatchUserType = async (userIds) => {
  const users = await prisma.user.findMany({
    where: {
      id: {
        in: userIds,
      },
    },
  });

  const userMaps: { [key: string]: User } = {};

  users.forEach((user) => (userMaps[user.id] = user));

  return userIds.map((id) => userMaps[id]);
};

//@ts-ignore
export const userLoader = new dataLoader<number, User>(batchUsers);
