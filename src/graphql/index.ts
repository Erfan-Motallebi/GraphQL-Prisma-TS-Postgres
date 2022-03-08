import { postResolver } from "./resolver/postResolver";
import { testResolver } from "./resolver/testResolver";
import { userResolver } from "./resolver/userResolver";

export const resolvers = {
  Query: {
    ...testResolver.Query,
    ...postResolver.Query,
    ...userResolver.Query,
  },
  Mutation: {
    ...postResolver.Mutation,
    ...userResolver.Mutation,
  },

  /**
   * Other Specific Types - User Repository
   */

  UserMeUnion: {
    ...userResolver.UserMeUnion,
  },

  /**
   * Other Specific Types - Post Repository
   */
};
