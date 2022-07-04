/**
 * User Route
 */
"use strict";

import config from "../utils/config/config.js";
import logger from "../utils/logger/logger.js";
import express from "express";
import User from "./user.model.js";
import passport from "../utils/auth/passport.js";

const userRouter = express.Router();

/**
 * Register a new user with email and password
 *
 * @example
 * ```js
 * curl --verbose \
 *   --request POST \
 *   --header 'Content-Type:application/json' \
 *   --data '{"fullname": "Morteza Mirbostani", "email": "m.mirbostani@gmail.com", "password": "123456", "birthday": "1990-01-01"}' \
 *   http://localhost:7000/api/register
 *
 * {
 *   "user": {
 *     "active": true,
 *     "blocked": false,
 *     "_id": "62972b7c53cdbb4998d4a163",
 *     "fullname": "Morteza Mirbostani",
 *     "username": "b5e6bfc3-2f3c-42f8-bd1a-00d3ff5476ff",
 *     "email": "m.mirbostani@gmail.com",
 *     "birthday": "1990-01-01T00:00:00.000Z",
 *     "salt": "$2b$10$fPLiCgkC9u69nxet.6awS.",
 *     "hashed_password": "$2b$10$fPLiCgkC9u69nxet.6awS.dVbf8JUGIbQWtu58Cf/oZY2NZyjJy0a",
 *     "updated_at": "2022-06-01T09:03:56.605Z",
 *     "created_at": "2022-06-01T09:03:56.605Z",
 *     "__v": 0
 * }
 * ```
 */
userRouter.post("/register", (req, res) => {
  User.signUpByEmail(req.body, (err, user) => {
    if (err) {
      res.status(500).json({
        message: err.message,
      });
      return;
    }
    res.status(200).json({
      user: user,
    });
  });
});

/**
 * Authenticate user and generate a jwt token
 *
 * @example
 * ```shell
 * curl --verbose \
 *   --request POST \
 *   --header 'Content-Type:application/json' \
 *   --data '{"email": "m.mirbostani@gmail.com", "password": "123456"}' \
 *   http://localhost:7000/api/authenticate
 *
 * {
 *   "token": {
 *     "email": "m.mirbostani@gmail.com",
 *     "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiMDA5ZmIwZmI5YzQzNTExYzRkYzkwZTY5YzhmMDA1ZTI5ODllYzMwYzdiNDUzMDI5OThhOGQ1MWFjZGY1ODFlMCIsImlhdCI6MTY1NDA4MjAxMiwiZXhwIjoxNjU0Njg2ODEyLCJpc3MiOiJjbGltZWRvIn0.YITCy1cpu9UtJGoQOZR8fL0jUlW2vYeyXLoDoQK2aIbk_ks7CyvahLsGMcUmo-MObaWLI8OeJ3hGpChZeAV9vz5wBLvTAI2rtyx1wj8E-sWFEAOf9QLaL7xdNDP1ERLLSBPM0193b1zf4CIACgU0oN3kTlSODtY7hp4ue5O4GBO9zIlM8ICwZEGgNR4jIZBczyy28Xe2d5bzD7lI2cAH4MDlFDsi8D0N3i5GKjUAdsdkvfMmwzpJ_orWfw4wEdNjSs0wHUY3Xz9S_9pHC9EHLCTks2F8Ftiiyv9w3o0Je_9TgiaAc4XcL-xKgnkNMhW_ICgZgQf4JoVujbNWJjl_FQ"
 * }
 * ```
 */
userRouter.post("/authenticate", (req, res) => {
  User.authenticateWithTokenByEmail(
    req.body.email,
    req.body.password,
    (err, token) => {
      if (err) {
        res.status(500).json({
          message: err.message,
        });
        return;
      }
      res.status(200).json({
        token: token,
      });
    }
  );
});

/**
 * Edit user credentials
 * Note: no email confirmation is implemented
 *
 * @example
 * ```shell
 * curl --verbose \
 *   --request PUT \
 *   --header 'Content-Type:application/json' \
 *   --header 'Authorization: JWT eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNDQ5ZjQ0MGEyMmFlMDlhYzZhZjhkMWI5ZGQ2NmRkZmFkYWQzNGJlNWQwZGUyOWFkMjVkZTA3MDZkZDkxMzQxMCIsImlhdCI6MTY1NDA4NjQyNywiZXhwIjoxNjU0NjkxMjI3LCJpc3MiOiJjbGltZWRvIn0.iqg5WHHj51E5VFSxL_G4spEZx_gXs3I1sdXcusUXdeabdZ7l71RoCQiZBdfUuthLJC8b5JF0USXJCMTjLWY8JPyTav5EBkWafoMQcb4pJTCMBOvK83M0wPlxlgCvdmWyDCB9aLRtHcmaXIMfwXupCWDwnsOuTQ4KOREoznERlhmlDK_3eJ98qfW60bvrrM1UWL0T1LokEHN_I16rrRjvKOncUGMsgtGtyDsDd_v_CknuaV5ZDAtZZUPyiDx5wU0dARFgF2-Zl7rnhz_ZpXfFA1EejbzIQhne04vXO5MwPrdjNGnSi7-8BNgKnvQaZESKslnS23Gk2uYpqNcvBZ4p-w' \
 *   --data '{"email": "m.mirbostani2@gmail.com", "password": "1234567"}' \
 *   http://localhost:7000/api/users/m.mirbostani@gmail.com
 *
 * {
 *   "user": {
 *     "email": "m.mirbostani2@gmail.com"
 * }
 * ```
 */
userRouter.put("/users/:email", passport.jwtAuthenticate, (req, res) => {
  if (req.params.email !== req.user.email) {
    let err = new Error("Unauthorized");
    res.status(403).json({
      message: err.message,
    });
    return;
  }
  User.updateCredentials(req.user._id, req.body, (err, user) => {
    if (err) {
      res.status(500).json({
        message: err.message,
      });
      return;
    }
    res.status(200).json({
      user: user,
    });
  });
});

/**
 * Sign out the user by deleting its active access token.
 * 
 * @example
 * ```shell
 * curl --verbose \
 *   --request DELETE \
 *   --header 'Content-Type:application/json' \
 *   --header 'Authorization: JWT eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiMTkwOGRhYmI3Y2U2NTZjZjcxZjg1MmFjY2I4NmY0Nzc0ZDJiYjU3NmQ2M2Y0NjY5MDIwZmRmMGUzYzExMTQ5NCIsImlhdCI6MTY1NDA4NzYxNiwiZXhwIjoxNjU0NjkyNDE2LCJpc3MiOiJjbGltZWRvIn0.i0vYr6FxkzS3yYuKexTwx6Y0RjpSClKFYgetGfn2UTkhxNT66VZj-3W8L99wiF8WgoMuFlclme2e630Zjui-MEprPEjYv8-Zkmqqx5rRGZ6mQncV4VzYBuakDplOQX1al2M8ywUSNiPsze_gOLRJcT3SI4O8DYqpER6Rba8dQ1ObbHa2GwtD1tkjMbjMZU-jj2ubdxN1QibnQoYaZiZM7orycExsAUvTg6jS39drpLTUYoBdrZ_YclvHzG46T6hNcBkOxS-o_E-JTluB93k3TBpJWAYiVuuID22VCwWXac4oo2iDIJNMHVZJyUUlF3ge1rULq3YY_nJMMcFKw3TS7Q' \
 *   http://localhost:7000/api/users/m.mirbostani@gmail.com
 * 
 * {
 *   "logged_out": true
 * }
 * ```
 */
userRouter.delete(
  "/users/:email",
  passport.jwtAuthenticate,
  function (req, res) {
    if (req.params.email !== req.user.email) {
      let err = new Error("Unauthorized");
      res.status(403).json({
        message: err.message,
      });
      return;
    }
    req.user.logout((err, isLoggedOut) => {
      if (err) {
        res.status(500).json({
          message: err.message,
        });
        return;
      }
      res.status(200).json({
        logged_out: isLoggedOut,
      });
    });
  }
);


/**
 * Exports
 */
export default userRouter;
