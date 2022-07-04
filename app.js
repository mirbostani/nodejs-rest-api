/**
 * Server app
 */

"use strict";

/**
 * Dependencies
 */
import config from "./utils/config/config.js";
import logger from "./utils/logger/logger.js";
import http from "node:http";
import os from "node:os";
import cluster from "node:cluster";
import express from "express";
import favicon from "serve-favicon";
import bodyParser from "body-parser";
import compression from "compression";
import { connect as connectToMongoDB } from "./utils/mongodb/mongoose.js";
import { connect as connectToRedis } from "./utils/redis/redis.js";
import { NotFoundError } from "./core/error.js";
import passport from "./utils/auth/passport.js";
import User from "./core/user.model.js";

/**
 * Routers
 */
import userRouter from "./core/user.route.js";
import adminRouter from "./core/admin.route.js";

/**
 * Connect to databases
 */
connectToMongoDB();
connectToRedis();

/**
 * Create a dummy user
 */
User.createDummyAdmin();

/**
 * Express App
 */
const app = express();

app.set("host", config.get("server:host"));
app.set("port", config.get("server:port"));
app.set("json spaces", 2); // pretty print
app.set("view engine", "ejs");

app.use((req, res, next) => {
  res.header("X-Powered-By", config.get("server:x_powered_by"));
  res.setHeader(
    "Access-Control-Allow-Origin",
    config.get("server:access_control_allow_origin")
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    config.get("server:access_control_allow_methods")
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    config.get("server:access_control_allow_headers")
  );
  res.setHeader(
    "Access-Control-Allow-Credentials",
    config.get("server:access_control_allow_credentials")
  );
  next();
});

app.use(config.get("server:static_prefix"), express.static("./public"));
app.use(favicon("./public/images/favicon.ico"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(compression());
app.use(passport.initialize());

/**
 * API Routes
 */
app.get(config.get("api:root"), (req, res) => {
  res.status(200).json({
    message: config.get("server:name"),
  });
});

app.use(config.get("api:root"), userRouter);
app.use(config.get("api:root"), adminRouter);

/**
 * Catch 404 and forward to error handler
 */
app.use((req, res, next) => {
  const err = new NotFoundError();
  next(err);
});

app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    // ...err.public(),
    message: err.message,
    code: err.code,
  });
});

/**
 * Run server with workers
 */
const cores = Math.min(config.get("server:workers"), os.cpus().length);

if (cluster.isMaster && cores > 1) {
  let workers = [];
  for (let i = 0; i < cores; i++) {
    workers.push(cluster.fork()); // create a worker
  }
  cluster.on("online", (worker) => {
    logger.info(`Worker ${worker.process.pid} is online.`);
  });
  cluster.on("exit", (worker, code, signal) => {
    logger.info(
      `Worker ${worker.process.pid} died with code ${code} and signal ${signal}`
    );
    workers.push(cluster.fork()); // recreate a worker
  });
} else {
  // app.listen(7000, "localhost");
  const server = http.createServer(app);
  server.listen(app.get("port"), app.get("host"), () => {
    logger.info(
      `Server listening on http://${app.get("host")}:${app.get("port")}`
    );
  });
}
