/**
 * Admin route
 */
"use strict";

import config from "../utils/config/config.js";
import logger from "../utils/logger/logger.js";
import express from "express";
import User from "./user.model.js";
import passport from "../utils/auth/passport.js";

const adminRouter = express.Router();

/**
 * Get all non-admin users.
 * @private
 *
 * @example
 * ```shell
 * curl --verbose \
 *  --request GET \
 *  --header 'Content-Type:application/json' \
 *  --header 'Authorization: JWT eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiYWU5OWZiYmY4MWVjY2UyZjYxMTUxNjlkZGQzNDM3NTBkMWE3YzQ4YjE4MzljZGYyOTE0ZTAxZjhjNWVlYjIxYiIsImlhdCI6MTY1NDA4OTc3MywiZXhwIjoxNjU0Njk0NTczLCJpc3MiOiJjbGltZWRvIn0.jqe3yYeSHl3U322yI-5OvizZgZWUw8iMJfn6rUrT5fPo8YTcnNzITFcjCd0gXQjVZmznioS7fNAOLgGKRjFYvrKTAMCVtfaascasoFixrus7QX95-SKFo1RxJoH3CR8Pj6pcFv1s2l32j2oRvFD5QNIe--j08L5w-izNVcskmAjUGSgwFcR2UZYHPffFNWROf5Hp6H5_ooMHwjP4VkPZ4kOzAB5ynlhIJrBKTRxrX4h3WRT6lgQ5nuNhSvLmU169RQupi587LOQJv9zo64t3KDaV1zpAqKNyeTGJsYpiJAQLo6FycDy7dMhWvX6JlN4ziTlqZcwC3m3qwvYY5LRUNw' \
 *  http://localhost:7000/api/admin/users/?limit=5
 *
 * {
 *   "users": [
 *     {
 *       "_id": "62976705eae4c68c5993872c",
 *       "active": true,
 *       "blocked": false,
 *       "is_admin": false,
 *       "fullname": "Morteza Mirbostani",
 *       "username": "1ff4e807-69bf-4d11-a116-00f1fd090f16",
 *       "email": "m.mirbostani@gmail.com",
 *       "birthday": "1990-01-01T00:00:00.000Z",
 *       "salt": "$2b$10$SbmBvQLmnwdjdGQynSkFdO",
 *       "hashed_password": "$2b$10$SbmBvQLmnwdjdGQynSkFdO44VpHYeOMFORRQ9WVfg4Utw9Rreowa6",
 *       "updated_at": "2022-06-01T13:17:57.739Z",
 *       "created_at": "2022-06-01T13:17:57.739Z",
 *       "__v": 0
 *     }
 *   ]
 * }
 * ```
 */
adminRouter.get("/admin/users", passport.jwtAuthenticate, (req, res) => {
  if (!req.user.is_admin) {
    let err = new Error("Not allowed");
    res.status(405).json({
      message: err.message,
    });
    return;
  }
  res.user.getUsers(req.query.limit, (err, users) => {
    if (err) {
      res.status(500).json({
        message: err.message,
      });
      return;
    }
    res.status(200).json({
      users: users,
    });
  });
});

/**
 * Get one non-admin user by email
 * @private
 *
 * @example
 * ```shell
 * curl --verbose \
 *   --request GET \
 *   --header 'Content-Type:application/json' \
 *   --header 'Authorization: JWT eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiYWU5OWZiYmY4MWVjY2UyZjYxMTUxNjlkZGQzNDM3NTBkMWE3YzQ4YjE4MzljZGYyOTE0ZTAxZjhjNWVlYjIxYiIsImlhdCI6MTY1NDA4OTc3MywiZXhwIjoxNjU0Njk0NTczLCJpc3MiOiJjbGltZWRvIn0.jqe3yYeSHl3U322yI-5OvizZgZWUw8iMJfn6rUrT5fPo8YTcnNzITFcjCd0gXQjVZmznioS7fNAOLgGKRjFYvrKTAMCVtfaascasoFixrus7QX95-SKFo1RxJoH3CR8Pj6pcFv1s2l32j2oRvFD5QNIe--j08L5w-izNVcskmAjUGSgwFcR2UZYHPffFNWROf5Hp6H5_ooMHwjP4VkPZ4kOzAB5ynlhIJrBKTRxrX4h3WRT6lgQ5nuNhSvLmU169RQupi587LOQJv9zo64t3KDaV1zpAqKNyeTGJsYpiJAQLo6FycDy7dMhWvX6JlN4ziTlqZcwC3m3qwvYY5LRUNw' \
 *   http://localhost:7000/api/admin/users/m.mirbostani@gmail.com
 *
 * {
 *   "user": {
 *     "_id": "62976705eae4c68c5993872c",
 *     "active": true,
 *     "blocked": false,
 *     "is_admin": false,
 *     "fullname": "Morteza Mirbostani",
 *     "username": "1ff4e807-69bf-4d11-a116-00f1fd090f16",
 *     "email": "m.mirbostani@gmail.com",
 *     "birthday": "1990-01-01T00:00:00.000Z",
 *     "salt": "$2b$10$SbmBvQLmnwdjdGQynSkFdO",
 *     "hashed_password": "$2b$10$SbmBvQLmnwdjdGQynSkFdO44VpHYeOMFORRQ9WVfg4Utw9Rreowa6",
 *     "updated_at": "2022-06-01T13:17:57.739Z",
 *     "created_at": "2022-06-01T13:17:57.739Z",
 *     "__v": 0
 *   }
 * }
 * ```
 */
adminRouter.get("/admin/users/:email", passport.jwtAuthenticate, (req, res) => {
  if (!req.user.is_admin) {
    let err = new Error("Not allowed");
    res.status(405).json({
      message: err.message,
    });
    return;
  }
  req.user.getUserByEmail(req.params.email, (err, user) => {
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
 * Create a user.
 *
 * @example
 * ```shell
 * curl --verbose \
 *  --request POST \
 *  --header 'Content-Type:application/json' \
 *  --header 'Authorization: JWT eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiYWU5OWZiYmY4MWVjY2UyZjYxMTUxNjlkZGQzNDM3NTBkMWE3YzQ4YjE4MzljZGYyOTE0ZTAxZjhjNWVlYjIxYiIsImlhdCI6MTY1NDA4OTc3MywiZXhwIjoxNjU0Njk0NTczLCJpc3MiOiJjbGltZWRvIn0.jqe3yYeSHl3U322yI-5OvizZgZWUw8iMJfn6rUrT5fPo8YTcnNzITFcjCd0gXQjVZmznioS7fNAOLgGKRjFYvrKTAMCVtfaascasoFixrus7QX95-SKFo1RxJoH3CR8Pj6pcFv1s2l32j2oRvFD5QNIe--j08L5w-izNVcskmAjUGSgwFcR2UZYHPffFNWROf5Hp6H5_ooMHwjP4VkPZ4kOzAB5ynlhIJrBKTRxrX4h3WRT6lgQ5nuNhSvLmU169RQupi587LOQJv9zo64t3KDaV1zpAqKNyeTGJsYpiJAQLo6FycDy7dMhWvX6JlN4ziTlqZcwC3m3qwvYY5LRUNw' \
 *  --data '{"fullname": "John Smith", "email": "m.mirbostani@gmail.com", "password": "abc123", ...}' \
 *  http://localhost:7000/api/admin/users
 * 
 * {
 *   "updated": true
 * }
 * ```
 */
adminRouter.post("/admin/users", passport.jwtAuthenticate, (req, res) => {
  if (!req.user.is_admin) {
    let err = new Error("Not allowed");
    res.status(405).json({
      message: err.message,
    });
    return;
  }
  req.user.createUser(req.body, (err, user) => {
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
 * Update users' profile.
 *
 * @example
 * ```shell
 * curl --verbose \
 *  --request PUT \
 *  --header 'Content-Type:application/json' \
 *  --header 'Authorization: JWT eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiYWU5OWZiYmY4MWVjY2UyZjYxMTUxNjlkZGQzNDM3NTBkMWE3YzQ4YjE4MzljZGYyOTE0ZTAxZjhjNWVlYjIxYiIsImlhdCI6MTY1NDA4OTc3MywiZXhwIjoxNjU0Njk0NTczLCJpc3MiOiJjbGltZWRvIn0.jqe3yYeSHl3U322yI-5OvizZgZWUw8iMJfn6rUrT5fPo8YTcnNzITFcjCd0gXQjVZmznioS7fNAOLgGKRjFYvrKTAMCVtfaascasoFixrus7QX95-SKFo1RxJoH3CR8Pj6pcFv1s2l32j2oRvFD5QNIe--j08L5w-izNVcskmAjUGSgwFcR2UZYHPffFNWROf5Hp6H5_ooMHwjP4VkPZ4kOzAB5ynlhIJrBKTRxrX4h3WRT6lgQ5nuNhSvLmU169RQupi587LOQJv9zo64t3KDaV1zpAqKNyeTGJsYpiJAQLo6FycDy7dMhWvX6JlN4ziTlqZcwC3m3qwvYY5LRUNw' \
 *  --data '{"fullname": "John Smith", "password": "abc123"}' \
 *  http://localhost:7000/api/admin/users/m.mirbostani@gmail.com
 *
 * {
 *   "updated": true
 * }
 * ```
 */
adminRouter.put("/admin/users/:email", passport.jwtAuthenticate, (req, res) => {
  if (!req.user.is_admin) {
    let err = new Error("Not allowed");
    res.status(405).json({
      message: err.message,
    });
    return;
  }
  req.user.updateUserByEmail(req.params.email, req.body, (err, isUpdated) => {
    if (err) {
      res.status(500).json({
        message: err.message,
      });
      return;
    }
    res.status(200).json({
      updated: isUpdated,
    });
  });
});

/**
 * Delete users
 *
 * @example
 * ```shell
 * curl --verbose \
 *  --request DELETE \
 *  --header 'Content-Type:application/json' \
 *  --header 'Authorization: JWT eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiYWU5OWZiYmY4MWVjY2UyZjYxMTUxNjlkZGQzNDM3NTBkMWE3YzQ4YjE4MzljZGYyOTE0ZTAxZjhjNWVlYjIxYiIsImlhdCI6MTY1NDA4OTc3MywiZXhwIjoxNjU0Njk0NTczLCJpc3MiOiJjbGltZWRvIn0.jqe3yYeSHl3U322yI-5OvizZgZWUw8iMJfn6rUrT5fPo8YTcnNzITFcjCd0gXQjVZmznioS7fNAOLgGKRjFYvrKTAMCVtfaascasoFixrus7QX95-SKFo1RxJoH3CR8Pj6pcFv1s2l32j2oRvFD5QNIe--j08L5w-izNVcskmAjUGSgwFcR2UZYHPffFNWROf5Hp6H5_ooMHwjP4VkPZ4kOzAB5ynlhIJrBKTRxrX4h3WRT6lgQ5nuNhSvLmU169RQupi587LOQJv9zo64t3KDaV1zpAqKNyeTGJsYpiJAQLo6FycDy7dMhWvX6JlN4ziTlqZcwC3m3qwvYY5LRUNw' \
 *  http://localhost:7000/api/admin/users/m.mirbostani@gmail.com
 *
 * {
 *   "deleted": true
 * }
 * ```
 */
adminRouter.delete(
  "/admin/users/:email",
  passport.jwtAuthenticate,
  (req, res) => {
    if (!req.user.is_admin) {
      let err = new Error("Not allowed");
      res.status(405).json({
        message: err.message,
      });
      return;
    }
    req.user.deleteUserByEmail(req.params.email, (err, isDeleted) => {
      if (err) {
        res.status(500).json({
          message: err.message,
        });
        return;
      }
      res.status(200).json({
        deleted: isDeleted,
      });
    });
  }
);

/**
 * Exports
 */
export default adminRouter;
