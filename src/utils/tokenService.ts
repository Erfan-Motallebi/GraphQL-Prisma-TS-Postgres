import { IUserPayload } from "./../graphql/resolver/userResolver";
import jwt from "jsonwebtoken";

declare let process: {
  env: {
    USER_SIGNUP_SECRET_KEY: string;
  };
};

namespace jwtHelper {
  export const asyncSign = (args: IUserAuthGen) => {
    return new Promise(
      (
        resolve: (token: string) => void,
        reject: (err: IUserPayload) => void
      ) => {
        jwt.sign(
          args,
          process.env.USER_SIGNUP_SECRET_KEY,
          { expiresIn: 60 * 60 * 24 },
          (err: any, token) => {
            if (!err) {
              return resolve(token as string);
            }
            return reject({
              userError: [
                {
                  message: err.message,
                },
              ],
              token: null,
            });
          }
        );
      }
    );
  };

  export const asyncVerify = (token: string) => {
    return new Promise(
      (
        resolve: (data: string | jwt.JwtPayload | undefined) => void,
        reject: (err: IUserPayload) => void
      ) => {
        jwt.verify(
          token,
          process.env.USER_SIGNUP_SECRET_KEY,
          (err, decoded) => {
            if (!err) {
              resolve(decoded);
            }
            return reject({
              userError: [{ message: "Token not valid." }],
              token: null,
            });
          }
        );
      }
    );
  };
  export const asyncTokenDecoder = (token: string) => {
    return new Promise(
      (
        resolve: (decoded: jwt.Jwt) => void,
        reject: (err: IUserPayload) => void
      ) => {
        const decoded = jwt.decode(token, { complete: true });
        if (!decoded) {
          reject({
            userError: [{ message: "Failed to decode the token" }],
            token: null,
          });
        }
        resolve(decoded as jwt.Jwt);
      }
    );
  };
}

interface IUserAuthGen {
  userId: number;
  email: string;
}

export const tokenService = {
  async userAuthTokenGen(
    authArgs: IUserAuthGen
  ): Promise<IUserPayload | string> {
    try {
      return await jwtHelper.asyncSign(authArgs);
    } catch (error: any) {
      return error;
    }
  },
  async tokenVerify(token: string) {
    try {
      return await jwtHelper.asyncVerify(token);
    } catch (error: any) {
      throw error;
    }
  },
  async tokenDecoder(token: string) {
    try {
      return (await jwtHelper.asyncTokenDecoder(token))
        .payload as jwt.JwtPayload;
    } catch (error: any) {
      return error;
    }
  },
};
