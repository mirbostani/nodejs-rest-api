/**
 * Mongoose Module
 */

"use strict";

import config from "../config/config.js";
import logger from "../logger/logger.js";
import mongoose from "mongoose";
import Promise from "bluebird";
mongoose.Promise = Promise;

const connect = () => {
  const host = config.get("mongodb:host");
  const port = config.get("mongodb:port");
  const database = config.get("mongodb:database");
  const uri = `mongodb://${host}:${port}/${database}`;
  const options = {
    autoIndex: config.get("mongodb:auto_index"),
    maxPoolSize: config.get("mongodb:max_pool_size"),
    serverSelectionTimeoutMS: config.get("mongodb:server_selection_timeout_ms"),
    connectTimeoutMS: config.get("mongodb:connect_timeout_ms"),
    socketTimeoutMS: config.get("mongodb:socket_timeout_ms"),
    family: config.get("mongodb:family"),
    ...(config.get("mongodb:authenticate")
      ? {
          user: config.get("mongodb:username"),
          pass: config.get("mongodb:password"),
        }
      : {}),
  };

  mongoose.set("debug", config.get("mongodb:debug"));
  mongoose.connect(uri, options, (err) => {
    if (err) {
      logger.error(`Failed to connect to ${uri}`);
      logger.error(err);
      process.exit(1);
      return;
    }
    logger.info(`Successful connection to ${uri}`);
    // logger.info(options);
  });
};

/**
 * Exports
 */
export { connect };
export default mongoose;
