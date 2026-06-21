export const hasE2eDatabase =
  Boolean(process.env.RUN_E2E_DB) && process.env.RUN_E2E_DB !== "false";

export const publicApiHealthPath = "/api/v1/health";
export const publicOpenApiPath = "/api/v1/openapi.json";
