import { gql } from "apollo-server";

export const typeDefs = gql`
  interface Node {
    id: ID!
  }

  type User implements Node {
    id: ID!
    email: String!
    name: String!
    createdAt: String!
    post: [Post]
    profile: Profile
  }

  type Profile implements Node {
    id: ID!
    bio: String!
    user: User
  }

  type Post implements Node {
    id: ID!
    title: String!
    content: String!
    published: Boolean
    createdAt: String!
    user: User
  }

  input PostArgsInput {
    title: String!
    content: String!
    published: Boolean
  }

  type UserError {
    message: String!
  }

  type PostPayloads {
    userError: [UserError!]
    post: Post
  }

  type UserPayloads {
    userError: [UserError!]
    token: String
  }

  union UserMeUnion = User | UserError

  input UserRegInput {
    email: String!
    name: String
    password: String!
    bio: String!
  }

  input UserSignInput {
    email: String!
    password: String!
    confirmPassword: String!
  }

  type Query {
    posts: [Post!]!
    hello: String!
    userMe(userId: ID!): UserMeUnion
  }

  type Mutation {
    # Post Mutation

    postCreate(postArgs: PostArgsInput!): PostPayloads!
    postUpdate(postId: ID!, postArgs: PostArgsInput!): PostPayloads!
    postDelete(postId: ID!): PostPayloads!

    # User Mutation

    userRegistration(userArgs: UserRegInput!): UserPayloads!
    userSignIn(userArgs: UserSignInput!): UserPayloads!
  }
`;
