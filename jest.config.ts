/* eslint-disable @typescript-eslint/naming-convention */
import type { Config } from "@jest/types";

export default {
  testEnvironment: "node",
  testMatch: ["<rootDir>/src/**/?(*.)+(test).[tj]s"],
  preset: "ts-jest",
  transform: {
    "^.+\\.[t|j]s$": "ts-jest",
  },
  testPathIgnorePatterns: ["<rootDir>/node_modules"],
} as Config.InitialOptions;
