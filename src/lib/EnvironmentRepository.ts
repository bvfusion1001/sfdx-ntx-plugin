/**
 * Looks for .envrc file in project root and returns values in an object
 */
export class EnvironmentRepository {
  constructor() {
    require("dotenv").config();
  }
  get(environmentVariable: string): string {
    return environmentVariable in process.env
      ? process.env[environmentVariable]
      : "";
  }
}
