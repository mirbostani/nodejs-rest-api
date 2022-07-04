/**
 * Logger Utility
 */

"use strict";

import config from "../config/config.js";
import debug from "debug";

const logger = {
  warning: debug("WARNING"),
  error: debug("ERROR"),
  info: debug("INFO"),
};

/**
 * Exports
 */
export default logger;