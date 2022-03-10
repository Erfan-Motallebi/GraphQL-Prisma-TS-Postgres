import { userLoader } from "./../dataLoaders/userLoader";
import { User } from "@prisma/client";
import { Post } from ".prisma/client";
import { IContext } from "../..";
import { inputValidation } from "../../utils/inputValidation";
import { tokenService } from "../../utils/tokenService";

export interface IPostArgs {
  postArgs: {
    title: string;
    content: string;
    published?: boolean;
  };
}

interface IPostPayload {
  userError: { message: string }[];
  post: Post | null;
}

export const postResolver = {
  Mutation: {
    postCreate: async (
      _: any,
      args: IPostArgs,
      { prisma, req }: IContext
    ): Promise<IPostPayload> => {
      const { title, content, published } = args["postArgs"];

      try {
        await inputValidation.postCreationValidation(args);

        const token = req.headers["authorization"] as string;

        if (!token) {
          return {
            userError: [{ message: "Token not privded" }],
            post: null,
          };
        }

        await tokenService.tokenVerify(token);

        const userDecodedToken = await tokenService.tokenDecoder(token);

        const newPost = await prisma.post.create({
          data: {
            title: title,
            content: content,
            published,
            authorId: userDecodedToken.userId,
          },
        });

        return {
          userError: [],
          post: newPost,
        };
      } catch (error: any) {
        return error;
      }
    },
    postUpdate: async (
      _: any,
      { postId, postArgs }: { postId: string; postArgs: IPostArgs["postArgs"] },
      { prisma, req }: IContext
    ): Promise<IPostPayload> => {
      const { title, content, published } = postArgs;

      const token = req.headers["authorization"] as string;

      if (!token) {
        return {
          userError: [{ message: "Token not privded" }],
          post: null,
        };
      }

      await tokenService.tokenVerify(token);

      const userDecodedToken = await tokenService.tokenDecoder(token);

      if (!title && !content) {
        return {
          userError: [
            {
              message:
                "You must provide at least one of the post args -> [Title] OR [Content]  ",
            },
          ],
          post: null,
        };
      }

      await inputValidation.postUpdateValidation({ postArgs: { ...postArgs } });

      const user = await prisma.user.findUnique({
        where: {
          email: userDecodedToken.email,
        },
      });

      const postBody: {
        title?: string;
        content?: string;
        published?: boolean;
      } = {
        title,
        content,
        published,
      };

      if (!title) delete postBody.title;
      if (!content) delete postBody.content;
      if (!published) delete postBody.published;

      const oldPost = await prisma.post.findUnique({
        where: {
          id: Number(postId),
        },
      });

      if (!oldPost) {
        return {
          userError: [{ message: "There's no such post to retreive" }],
          post: null,
        };
      }

      if (oldPost.authorId !== user?.id) {
        return {
          userError: [{ message: "Owned by another user." }],
          post: null,
        };
      }
      const updatedPost = await prisma.post.update({
        data: postBody,
        where: {
          id: parseInt(postId),
        },
      });

      return {
        userError: [],
        post: updatedPost,
      };
    },
    async postDelete(
      _: any,
      { postId }: { postId: string },
      { prisma, req }: IContext
    ): Promise<IPostPayload> {
      if (!postId) {
        return {
          userError: [
            {
              message:
                "Failed to get the proper Id. Please provide it with post ID",
            },
          ],
          post: null,
        };
      }

      const token = req.headers["authorization"] as string;

      if (!token) {
        return {
          userError: [{ message: "Token not privded" }],
          post: null,
        };
      }

      await tokenService.tokenVerify(token);

      const userDecodedToken = await tokenService.tokenDecoder(token);

      const user = await prisma.user.findUnique({
        where: {
          email: userDecodedToken.email,
        },
      });

      if (!user) {
        return {
          userError: [{ message: "Owned by another user." }],
          post: null,
        };
      }

      const post = await prisma.post.findUnique({
        where: {
          id: parseFloat(postId),
        },
      });

      if (!post) {
        return {
          userError: [
            {
              message: "Failed to get the post. It does not exist",
            },
          ],
          post: null,
        };
      }

      return {
        userError: [],
        post:
          post.id === user?.id
            ? await prisma.post.delete({
                where: {
                  id: Number(postId),
                },
              })
            : null,
      };
    },
  },
  Query: {
    posts: async (_: any, __: any, { prisma }: IContext): Promise<Post[]> => {
      return await prisma.post.findMany({
        orderBy: [
          {
            createdAt: "desc",
          },
        ],
      });
    },
  },

  Post: {
    async user(post: Post, __: any, { prisma }: IContext): Promise<User> {
      /**
       * 1 + N Requests [ using Dataloaders to reduce the I/O operation - Disk Block Access]
       */

      // return (await prisma.user.findUnique({
      //   where: {
      //     id: post.authorId,
      //   },
      // })) as User;

      return await userLoader.load(post.authorId);
    },
  },
};
