import { postResolver } from "./resolver/postResolver";
import { testResolver } from "./resolver/testResolver";
import { userResolver } from "./resolver/userResolver";

export const resolvers = {
  Query: {
    ...testResolver.Query,
    ...postResolver.Query,
  },
  Mutation: {
    ...postResolver.Mutation,
    ...userResolver.Mutation,
  },
};
