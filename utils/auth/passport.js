/**
 * Config Module
 */
"use strict";

import config from "../config/config.js";
import logger from "../logger/logger.js";
import passport from "passport";
import {Strategy as JwtStrategy, ExtractJwt} from "passport-jwt";
import User from "../../core/user.model.js";
import redis from "../redis/redis.js";
import crypto from "../crypto/crypto.js";

/**
 * Apply JWT strategy as a middleware
 */
let jwtStrategy = function (passport) {
  let options = {
    algorithms: [config.get("token:algorithm")],
    issuer: config.get("token:issuer"),
    secretOrKey: config.get("token:public_key"),
    jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme("jwt"),
    passReqToCallback: true,
  };
  passport.use(
    new JwtStrategy(options, function (req, jwtPayload, done) {
      let userId = crypto.decryptWithSecret(
        jwtPayload.user_id,
        config.get("token:payload_secret")
      );
      User.findById(userId, function (err, user) {
        if (err) {
          return done(err);
        } else {
          if (!user) {
            return done(null, false);
          } else {
            return done(null, user); // access through req.user
          }
        }
      });
    })
  );
};

/**
 * A middleware to apply JWT authentication strategy on a route.
 *
 * @example
 * ```js
 * router.get('/test', passport.jwtAuthenticate, (req, res) => {
 *  let user = req.user;
 *  ...
 * });
 * ```
 */
var jwtAuthenticate = function (req, res, next) {
  passport.authenticate(
    "jwt",
    {
      session: false,
    },
    async function (err, user, info) {
      if (err) {
        let e = new Error("Failed");
        res.status(403).json({
          message: e.message,
        });
        return;
      }
      logger.info(user);
      if (!user) {
        let e = new Error("Invalid access token.");
        res.status(403).json({
          message: e.message,
        });
        return;
      }
      User.updateLastLogin(String(user._id)); // no need for a callback
      if (!user.active) {
        let e = new Error("User not active");
        res.status(403).json({
          message: e.message,
        });
        return;
      }
      if (user.blocked) {
        let e = new Error("User is blocked");
        res.status(403).json({
          message: e.message,
        });
        return;
      }

      let key = User.prepareAccessTokenKey(String(user._id));
      let reply = await redis.defaultClient.get(key);
      if (!reply) {
        let e = new Error("Invalid access token");
        res.status(403).json({
          message: e.message,
        });
        return;
      }
      if (typeof req.headers.authorization !== "string") {
        let e = new Error("Invalid access token in header");
        res.status(403).json({
          message: e.message,
        });
        return;
      }
      let accessToken = req.headers.authorization.split("JWT ")[1];
      if (reply !== accessToken) {
        var e = new Error("Access token is invalid");
        res.status(403).json({
          message: e.message,
        });
        return;
      }
      req.user = user;
      return next();
    }
  )(req, res, next);
};

/**
 * Passport init
 */
let initialize = function () {
  let init = passport.initialize();
  jwtStrategy(passport);
  return init;
};

/**
 * Exports
 */
export default {
  passport,
  initialize,
  jwtAuthenticate,
};
