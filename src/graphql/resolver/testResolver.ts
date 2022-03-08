export const testResolver = {
  Query: {
    hello: async (): Promise<string> => {
      return "Hello - Welcome to my Social App";
    },
  },
};
