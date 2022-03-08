import { BIO_REGEX, EMAIL_REGEX, NAME_REGEX, PASSWORD_REGX } from "./constants";
import {
  IUserRegArgs,
  IUserPayload,
  IUserSignArgs,
} from "../graphql/resolver/userResolver";
import JOI, { ValidationError } from "joi";
import Joi from "joi";
import { IPostArgs } from "../graphql/resolver/postResolver";

export const inputValidation = {
  async userRegistrationValidation(
    userRegArgs: IUserRegArgs["userArgs"]
  ): Promise<IUserPayload> {
    const { email, password, bio, name } = userRegArgs;

    const userRegSchema = JOI.object({
      email: JOI.string()
        .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
        .required()
        .pattern(EMAIL_REGEX),
      name: JOI.string().optional().pattern(NAME_REGEX).min(4).max(50),
      password: JOI.string().required().pattern(PASSWORD_REGX).min(4).max(20),
      bio: JOI.string().optional().pattern(BIO_REGEX),
    });

    try {
      await userRegSchema.validateAsync(userRegArgs);
      return {
        userError: [],
        token: null,
      };
    } catch (error: any) {
      const errorOccured = error as ValidationError;
      return {
        userError: [
          {
            message: errorOccured.details[0].message,
          },
        ],
        token: null,
      };
    }
  },
  async userSigninValidation(signinArgs: IUserSignArgs) {
    const userSigninScehma = JOI.object({
      email: JOI.string()
        .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
        .required()
        .pattern(EMAIL_REGEX),
      password: JOI.string().required().min(4).max(50),
      confirmPassword: Joi.string()
        .valid(Joi.ref("password"))
        .required()
        .label("Confirm password")
        .options({ messages: { "any.only": "{{#label}} does not match" } }),
    });

    try {
      await userSigninScehma.validateAsync(signinArgs["userArgs"]);
      return true;
    } catch (error) {
      const errorOccured = error as ValidationError;
      throw {
        userError: [
          {
            message: errorOccured.details[0].message,
          },
        ],
        token: null,
      };
    }
  },
  async postCreationValidation(postArgs: IPostArgs) {
    const postItems = postArgs["postArgs"];
    const postItemsSchema = JOI.object({
      title: Joi.string().required().min(2),
      content: Joi.string().required().min(2),
      published: Joi.boolean().optional().default(false),
    });

    try {
      await postItemsSchema.validateAsync(postItems);
      return true;
    } catch (error) {
      const errorOccured = error as ValidationError;
      throw {
        userError: [
          {
            message: errorOccured.details[0].message,
          },
        ],
        token: null,
      };
    }
  },
  async postUpdateValidation(postArgs: IPostArgs) {
    const postItems = postArgs["postArgs"];
    const postItemsSchema = JOI.object({
      title: Joi.string().optional().min(2),
      content: Joi.string().optional().min(2),
      published: Joi.boolean().optional().default(false),
    });

    try {
      await postItemsSchema.validateAsync(postItems);
      return true;
    } catch (error) {
      const errorOccured = error as ValidationError;
      throw {
        userError: [
          {
            message: errorOccured.details[0].message,
          },
        ],
        token: null,
      };
    }
  },
};
