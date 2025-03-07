/** This is helpful for creating exhaustive if/else checks for unions. If you
 * put this in the last else statement, it will cause TS to tell you if you
 * haven't accounted for all the possibilities. */
export function assertNever(_x: never): never {
  throw new Error("Not reached.");
}
