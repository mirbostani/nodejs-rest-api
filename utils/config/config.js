/**
 * Config Module
 */

"use strict";

import fs from "node:fs";
import path from "node:path";
import nconf from "nconf";
import jsYaml from "js-yaml";

/**
 * Order of loading configurations
 */
const config = nconf
  .env()
  .argv()
  .overrides({
    server: {
      host: nconf.get("HOST") || nconf.get("host"),
      port: nconf.get("PORT") || nconf.get("port"),
    },
  })
  .defaults(
    jsYaml.load(
      fs.readFileSync(path.resolve("utils", "config", "config.yaml"), {
        encoding: "utf-8",
      })
    )
  )
  .file("fa", {
    file: path.resolve("utils", "i18n", "fa.json"),
  })
  .file("en", {
    file: path.resolve("utils", "i18n", "en.json"),
  })
  // Override configurations by package.json "config" properties
  .overrides({
    ...JSON.parse(
      fs.readFileSync(path.resolve("package.json"), { encoding: "utf-8" })
    )["config"],
  });

/**
 * Certificate
 */
nconf.set(
  "token:private_key",
  (function () {
    return fs.readFileSync(path.resolve("certs/server.key")).toString();
  })()
);

nconf.set(
  "token:public_key",
  (function () {
    return fs.readFileSync(path.resolve("certs/server.crt")).toString();
  })()
);

/**
 * Translation of the key based on a language.
 */
const tr = (lang, key) => {
  let text = nconf.get(`${lang}:${key}`);

  if (!text) {
    text = key;
  }

  return text;
};

/**
 * Exports
 */
export { tr };
export default nconf;
