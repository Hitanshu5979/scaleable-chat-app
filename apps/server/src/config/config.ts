import * as dotenv from "dotenv";

dotenv.config();

export const config = {
  redisUri: process.env.REDIS_CONNECTION_STRING,
};
