import { CustomError, NotFoundError } from "./error.js";
// const { CustomError, NotFoundError } = require("./error");

describe("CustomError", () => {
  it("should create an extendable error with a specific name, message, stack, and code", () => {
    const m = "custom error message";
    const e = new CustomError(m);

    expect(e.message).toBe(m);
    expect(e.name).toBe("CustomError");
    expect(e.code).toBe("ERR_CUSTOM");
    expect(typeof e.stack).toBe("string");
    expect(e).toBeInstanceOf(Error);
    expect(e).toBeInstanceOf(CustomError);
  });
});

describe("NotFoundError", () => {
  it("should create an instance of the error with a specific name, message, and code", () => {
    const e = new NotFoundError();

    expect(e.message).toBe("Not Found!");
    expect(e.name).toBe("NotFoundError");
    expect(e.code).toBe("ERR_NOT_FOUND");
    expect(e).toBeInstanceOf(Error);
    expect(e).toBeInstanceOf(CustomError);
    expect(e).toBeInstanceOf(NotFoundError);
  });
});
