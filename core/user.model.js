/**
 * User Model
 */
"use strict";

import config from "../utils/config/config.js";
import logger from "../utils/logger/logger.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import { v4 as uuidv4 } from "uuid";
import mongoose from "../utils/mongodb/mongoose.js";
import redis from "../utils/redis/redis.js";
import localCrypto from "../utils/crypto/crypto.js";

/**
 * User Schema
 */
let UserSchema = new mongoose.Schema({
  fullname: {
    type: String,
    maxlength: 128,
  },
  username: {
    type: String,
    unique: true,
    required: true,
    trim: true,
  },
  hashed_password: {
    type: String,
    required: true,
  },
  salt: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    maxlength: 256,
    validate: {
      validator: (email) => {
        return validator.isEmail(email);
      },
      message: "{VALUE} is not a valid email address.",
    },
  },
  birthday: {
    type: Date,
  },
  last_login: {
    type: Date,
  },
  active: {
    type: Boolean,
    default: true, // emial confirmation is not required in the coding challeng!
  },
  blocked: {
    type: Boolean,
    default: false,
  },
  is_admin: {
    type: Boolean,
    default: false,
  },
  created_at: {
    type: Date,
  },
  created_by: {
    type: mongoose.Schema.ObjectId,
  },
  updated_at: {
    type: Date,
  },
  updated_by: {
    type: mongoose.Schema.ObjectId,
  },
});

/**
 * Index
 */
UserSchema.set("autoIndex", config.get("mongodb:auto_index"));

/**
 * Virtual password field
 */
UserSchema.virtual("password")
  .set(function (password) {
    this.plain_password = password;
  })
  .get(function () {
    return this.plain_password;
  });

/**
 * Hash Password
 */
UserSchema.methods.hashPassword = function (password, cb) {
  let self = this;
  // bcrypt supports up to 31 rounds (12 takes 334ms)
  bcrypt.genSalt(config.get("bcrypt:rounds"), function (err, salt) {
    if (err) {
      cb(err);
      return;
    }
    self.salt = salt;
    bcrypt.hash(password, salt, function (err, hash) {
      if (err) {
        cb(err);
        return;
      }
      self.hashed_password = hash;
      cb(null, hash);
    });
  });
};

/**
 * Compare Password
 */
UserSchema.methods.comparePassword = function (password, cb) {
  bcrypt.compare(password, this.hashed_password, function (err, isMatch) {
    if (err) {
      cb(err);
    } else {
      cb(null, isMatch);
    }
  });
};

/**
 * Generate access token for the user
 */
UserSchema.methods.generateAccessToken = function (cb) {
  let self = this;
  let payload = {
    user_id: localCrypto.encryptWithSecret(
      self.id,
      config.get("token:payload_secret")
    ),
  };
  let options = {
    algorithm: config.get("token:algorithm"),
    expiresIn: config.get("token:expires_in"),
    issuer: config.get("token:issuer"),
  };
  jwt.sign(payload, config.get("token:private_key"), options, cb);
};

/**
 * Log user out by deleting the access token.
 */
UserSchema.methods.logout = async function (cb) {
  let key = User.prepareAccessTokenKey(String(this._id));
  let reply = await redis.defaultClient.del(key);
  if (!reply) {
    let e = new Error("Failed");
    cb(e);
    return;
  }
  cb(null, true);
};

/**
 * Find user by email
 */
UserSchema.statics.findUserByEmail = function (email, cb) {
  email = email.toLocaleLowerCase();
  if (!validator.isEmail(email)) {
    let e = new Error("Invalid email");
    cb(e);
    return;
  }
  User.findOne(
    {
      email: email,
    },
    function (err, user) {
      if (err) {
        let e = new Error("Failed");
        cb(e);
        return;
      }
      if (!user) {
        cb(null, null);
        return;
      }
      if (user.blocked) {
        let e = new Error("User is blocked");
        cb(e);
        return;
      }
      cb(null, user);
    }
  );
};

/**
 * Sign up by email
 *
 * @param {Object} data - Request body
 * @param {String} data.fullname
 * @param {String} data.username - Auto-generate if not provided
 * @param {String} data.password
 * @param {String} data.email
 * @param {String} data.birthday
 */
UserSchema.statics.signUpByEmail = function (data, cb) {
  if (!data.username || data.username.length < 3) {
    data.username = uuidv4();
  }
  if (!data.password) {
    let e = new Error("Password is required");
    cb(e);
    return;
  }
  if (!data.email) {
    let e = new Error("Email is required");
    cb(e);
    return;
  }
  data.email = data.email.toLocaleLowerCase(); // validation is inside schema

  // Check if user is already registered
  User.findUserByEmail(data.email, function (err, user) {
    if (err) {
      cb(err);
      return;
    }
    if (user) {
      let e = new Error("Email is already registered, use another one.");
      cb(e);
      return;
    }
    if (!user) {
      _signUpByEmail(data, cb);
      return;
    }
  });

  function _signUpByEmail(data, cb) {
    let user = new User();
    user.fullname = data.fullname || "";
    user.username = data.username;
    user.password = data.password;
    user.email = data.email;
    user.birthday = data.birthday;
    user.save(function (err, user_) {
      if (err) {
        logger.error(err);
        if (err.code === 11000 /* dup key */) {
          var e = new Error("User exists");
          cb(e);
          return;
        } else {
          var e = new Error("Internal error");
          cb(e);
          return;
        }
        return;
      }
      cb(null, user_);
    });
  }
};

/**
 * Find user by credentials
 * @param {String} email
 * @param {String} password
 */
UserSchema.statics.findUserByEmailAndPassword = function (email, password, cb) {
  if (!email || !password) {
    let e = new Error("Email and password are required.");
    cb(e);
    return;
  }
  User.findOne(
    {
      email: email,
    },
    async function (err, user) {
      if (err) {
        let e = new Error("Failed");
        cb(e);
        return;
      }
      if (!user) {
        let e = new Error("Invalid credentials");
        cb(e);
        return;
      }

      let key = "login_key:" + email;
      var reply = await redis.defaultClient.hGetAll(key);

      // Prevent if login lock key is valid
      if (
        reply !== null &&
        reply.retry >= config.get("redis:user_login_retry")
      ) {
        var ttl = await redis.defaultClient.ttl(key);
        let e = new Error("Authentication failed");
        cb(e);
        return;
      }

      // Compare provided password with the one stored
      user.comparePassword(password, async function (err, isMatch) {
        if (err) {
          let e = new Error("failed");
          cb(e);
          return;
        }
        if (!isMatch) {
          // Prevent brutefoce attacks
          var reply = await redis.defaultClient.hGetAll(key);
          if (reply !== null) {
            // Increment retry counter by 1 if lock exists
            var reply_ = await redis.defaultClient.hIncrBy(key, "retry", 1);
            var reply__ = await redis.defaultClient.expire(
              key,
              config.get("redis:user_login_locked_seconds")
            );
          } else {
            // Create login lock key
            var reply_ = await redis.defaultClient.hSet(key, {
              retry: 1,
            });
            var reply__ = await redis.defaultClient.expire(
              key,
              config.get("redis:user_login_locked_seconds")
            );
          }

          let e = new Error("Authentication failed");
          cb(e);
          return;
        }

        // Delete key if login is ok
        await redis.defaultClient.del(key);
        cb(null, user);
      });
    }
  );
};

/**
 * Authenticate user and generate a jwt token
 *
 * @param {String} email
 * @param {String} password
 */
UserSchema.statics.authenticateWithTokenByEmail = function (
  email,
  password,
  cb
) {
  User.findUserByEmailAndPassword(email, password, function (err, user) {
    if (err) {
      cb(err);
      return;
    }
    if (!user.active) {
      let e = new Error("User not active");
      cb(e);
      return;
    }
    if (user.blocked) {
      let e = new Error("User is blocked");
      cb(e);
      return;
    }
    user.generateAccessToken(async function (err, accessToken) {
      if (err) {
        let e = new Error("Failed");
        cb(e);
        return;
      }
      let key = User.prepareAccessTokenKey(String(user._id));
      var reply = await redis.defaultClient.set(key, accessToken);
      if (reply !== "OK") {
        // Failed to store the key
        var e = new Error("Authentication failed.");
        cb(e);
        return;
      }
      let expiresSeconds = config.get("token:expires_in");
      if (typeof expiresSeconds !== "number") {
        expiresSeconds = 60 * 60 * 24; // 1d (default)
      }
      var reply = await redis.defaultClient.expire(key, expiresSeconds);
      if (!reply) {
        // Failed to set expiry date on the access token
        var e = new Error("Authentication failed.");
        cb(e);
        return;
      }
      // Callback
      cb(null, {
        email: user.email,
        access_token: accessToken,
      });
    });
  });
};

/**
 * Update last login
 */
UserSchema.statics.updateLastLogin = function (userId, cb) {
  if (typeof cb !== "function") cb = () => {};
  let lastLogin = new Date();
  User.update(
    {
      _id: mongoose.Types.ObjectId(userId),
    },
    {
      $set: {
        last_login: lastLogin,
      },
    },
    {
      upsert: false,
    },
    function (err, result) {
      if (err) {
        let e = new Error("Failed");
        cb(e);
        return;
      }
      if (result.nModified !== 1) {
        let e = new Error("Failed to update last login");
        cb(e);
        return;
      }
      cb(null, lastLogin);
    }
  );
};

/**
 * Update user credentials
 */
UserSchema.statics.updateCredentials = function (userId, data, cb) {
  if (typeof cb !== "function") cb = () => {};
  userId = String(userId);
  let $set = {};
  if (data.email) {
    // email validation is performed in model schema
    $set.email = data.email;
  }
  if (data.password) {
    $set.password = data.password;
  }
  User.update(
    {
      _id: mongoose.Types.ObjectId(userId),
    },
    {
      $set: $set,
    },
    {
      upsert: false,
    },
    function (err, result) {
      logger.info(err);
      logger.info(result);
      if (err) {
        let e = new Error("Failed");
        cb(e);
        return;
      }
      logger.info(result);
      if (result.modifiedCount !== 1) {
        let e = new Error("Failed to update credentials");
        cb(e);
        return;
      }
      // After updating the credentials, the client should request for a new access token.
      cb(null, {
        email: $set.email,
        password: "changed", // do not sent password again!
      });
    }
  );
};

/**
 * Create a dummy admin
 */
UserSchema.statics.createDummyAdmin = function (cb) {
  if (typeof cb !== "function") cb = () => {};
  let email = config.get("admin:email");
  User.findUserByEmail(email, (err, user) => {
    if (!user) {
      let user = new User();
      user.fullname = config.get("admin:fullname");
      user.username = uuidv4();
      user.password = config.get("admin:password");
      user.email = email;
      user.birthday = new Date();
      user.is_admin = true;
      user.save((err, admin) => {
        if (err) {
          logger.error(err);
          if (err.code === 11000 /* dup key */) {
            var e = new Error("Admin exists");
            cb(e);
            return;
          } else {
            var e = new Error("Internal error");
            cb(e);
            return;
          }
          return;
        }
        cb(null, admin);
      });
    }
  });
};

/**
 * Get all the users (specific method for admin users)
 * @private
 */
UserSchema.methods.getUsers = function (limit, cb) {
  User.find({ is_admin: false })
    .limit(limit || 50)
    .lean()
    .exec((err, users) => {
      if (err) {
        let e = new Error("Failed");
        return;
      }
      cb(null, users);
    });
};

/**
 * Get one user (specific method for admin usesr)
 */
UserSchema.methods.getUserByEmail = function (email, cb) {
  if (!validator.isEmail(email)) {
    let err = new Error("Invalid email");
    cb(err);
    return;
  }
  User.findOne({ is_admin: false, email: email })
    .lean() // more efficient
    .exec((err, user) => {
      if (err) {
        let err = new Error("Failed");
        cb(err);
        return;
      }
      cb(null, user);
    });
};

/**
 * Create a user (specific method for admin users)
 */
UserSchema.methods.createUser = function (data, cb) {
  if (!data.username || data.username.length < 3) {
    data.username = uuidv4();
  }
  if (!data.password) {
    let e = new Error("Password is required");
    cb(e);
    return;
  }
  if (!data.email) {
    let e = new Error("Email is required");
    cb(e);
    return;
  }
  let user = new User();
  if (data.fullname) user.fullname = data.fullname;
  user.username = uuidv4();
  user.password = data.password;
  user.email = data.email;
  if (data.birthday) user.birthday = data.birthday;
  if (data.active) user.active = data.active;
  if (data.blocked) user.blocked = data.blocked;
  if (data.is_admin) user.is_admin = data.is_admin;
  user.created_at = new Date();
  user.created_by = this._id;
  user.updated_at = user.created_at;
  user.updated_by = user.created_by;
  user.save(function (err, user_) {
    if (err) {
      logger.error(err);
      if (err.code === 11000 /* dup key */) {
        var e = new Error("User exists");
        cb(e);
        return;
      } else {
        var e = new Error("Internal error");
        cb(e);
        return;
      }
      return;
    }
    cb(null, user_);
  });
};

/**
 * Update a user (specific method for admin users)
 */
UserSchema.methods.updateUserByEmail = function (email, data, cb) {
  if (!validator.isEmail(email)) {
    let err = new Error("Invalid email");
    cb(err);
    return;
  }
  let $set = {};
  if (data.fullname) $set.fullname = data.fullname;
  if (data.username) $set.username = data.username;
  if (data.email) $set.email = data.email;
  if (data.birthday) $set.birthday = data.birthday;
  if (data.active) $set.active = data.active;
  if (data.blocked) $set.blocked = data.blocked;
  if (data.is_admin) $set.is_admin = data.is_admin;
  $set.updated_at = new Date();
  $set.updated_by = this._id;
  User.updateOne(
    {
      email: email,
    },
    $set,
    (err, results) => {
      if (err) {
        let e = new Error("Failed");
        cb(e);
        return;
      }
      if (results.modifiedCount != 1) {
        let e = new Error("Update failed");
        cb(e);
        return;
      }
      cb(null, true);
    }
  );
};

/**
 * Delete a user (specific method for admin users)
 */
UserSchema.methods.deleteUserByEmail = function (email, cb) {
  if (!validator.isEmail(email)) {
    let err = new Error("Invalid email");
    cb(err);
    return;
  }
  User.deleteOne(
    {
      email: email,
    },
    (err, results) => {
      if (err) {
        let e = new Error("Failed");
        cb(e);
        return;
      }
      logger.info(results);
      if (results.deletedCount != 1) {
        let e = new Error("Delete failed");
        cb(e);
        return;
      }
      cb(null, true);
    }
  );
};

/**
 * Prepares a key string to be used as the access token key stored in a Redis db
 */
UserSchema.statics.prepareAccessTokenKey = function (userId) {
  return "access_token:user_id:" + userId;
};

/**
 * Pre events
 */
UserSchema.pre("validate", function (next) {
  var self = this;
  if (self.plain_password) {
    // Hash the password, only if the password is sent.
    self.hashPassword(self.plain_password, function (err, hash) {
      if (err) {
        next(err);
      } else {
        next();
      }
    });
  } else {
    next();
  }
});

UserSchema.pre("save", function (next) {
  this.updated_at = new Date();
  if (!this.created_at) {
    this.created_at = this.updated_at;
  }
  next();
});

/**
 * User Model
 */
let User = mongoose.model("User", UserSchema, "users");

/**
 * Exports
 */
export default User;
