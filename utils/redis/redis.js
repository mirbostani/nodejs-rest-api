/**
 * Redis Key/Value database
 */
"use strict";

import config from "../config/config.js";
import logger from "../logger/logger.js";
import { createClient } from "redis";

const defaultClient = createClient();
defaultClient.on("error", (err) => {
  logger.error(err);
});

const connect = async () => {
  await defaultClient.connect();
  // await defaultClient.auth(config.get("redis:auth_password")); // disabled
  await defaultClient.select(1);
  // await defaultClient.set("mykey", "myvalue");
  // const value = await defaultClient.get("mykey");
  // logger.info("Test value: " + value);
  logger.info(
    "Redis default client is connected to redis://" +
      config.get("redis:host") +
      ":" +
      config.get("redis:port")
  );
};

/**
 * Exports
 */
export { connect };
export default { defaultClient };
