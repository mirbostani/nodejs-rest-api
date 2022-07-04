/**
 * User Model
 */
"use strict";

import crypto from "crypto";

const encryptWithIV = function (text, key, iv, alg, in_enc, out_enc) {
  var cipher;
  var encrypted;

  alg = !alg ? "aes-256-cbc" : alg;
  in_enc = !in_enc ? "utf-8" : in_enc;
  out_enc = !out_enc ? "hex" : out_enc;

  cipher = crypto.createCipheriv(alg, key, iv);
  encrypted = cipher.update(text, in_enc, out_enc);
  encrypted += cipher.final(out_enc);

  return encrypted;
};

const decryptWithIV = function (encrypted, key, iv, alg, in_enc, out_enc) {
  var decipher;
  var decrypted;

  alg = !alg ? "aes-256-cbc" : alg;
  in_enc = !in_enc ? "hex" : in_enc;
  out_enc = !out_enc ? "utf-8" : out_enc;

  decipher = crypto.createDecipheriv(alg, key, iv);
  decrypted = decipher.update(encrypted, in_enc, out_enc);
  decrypted += decipher.final(out_enc);

  return decrypted;
};

const encryptWithSecret = function (text, secret, alg, in_enc, out_enc) {
  var cipher;
  var encrypted;

  alg = !alg ? "aes-256-cbc" : alg;
  in_enc = !in_enc ? "utf-8" : in_enc;
  out_enc = !out_enc ? "hex" : out_enc;

  cipher = crypto.createCipher(alg, secret);
  encrypted = cipher.update(text, in_enc, out_enc);
  encrypted += cipher.final(out_enc);

  return encrypted;
};

const decryptWithSecret = function (encrypted, secret, alg, in_enc, out_enc) {
  var decipher;
  var decrypted;

  alg = !alg ? "aes-256-cbc" : alg;
  in_enc = !in_enc ? "hex" : in_enc;
  out_enc = !out_enc ? "utf-8" : out_enc;

  decipher = crypto.createDecipher(alg, secret);
  decrypted = decipher.update(encrypted, in_enc, out_enc);
  decrypted += decipher.final(out_enc);

  return decrypted;
};

export default {
  encryptWithIV,
  decryptWithIV,
  encryptWithSecret,
  decryptWithSecret,
};
