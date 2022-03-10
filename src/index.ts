import { ApolloServer } from "apollo-server";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import { resolvers } from "./graphql";
import { typeDefs } from "./graphql/typeDefs";
import { Prisma, PrismaClient } from "@prisma/client";
import { Express } from "express";

export interface IContext {
  prisma: PrismaClient<
    Prisma.PrismaClientOptions,
    never,
    Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
  >;
  req: Express["request"];
}

export const prisma = new PrismaClient();

function bootstrap() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground],
    context: ({ req }) => {
      return {
        req,
        prisma,
      };
    },
  });

  server.listen(5005).then(({ url }) => {
    console.log(`🚀 Server is running on ${url}`);
  });
}

bootstrap();
