// 필수 환경 변수 검증
const REQUIRED_ENV_VARS = [
  "DATABASE_URL",
  "JWT_SECRET",
  "OAUTH_SERVER_URL",
] as const;

function validateEnv(): void {
  const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.error(
      `[ENV] Missing required environment variables: ${missing.join(", ")}`
    );
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        `Missing required environment variables: ${missing.join(", ")}`
      );
    }
  }
}

validateEnv();

export const ENV = {
  appId: process.env.VITE_APP_ID || process.env.APP_ID || "",
  cookieSecret: process.env.JWT_SECRET || "",
  databaseUrl: process.env.DATABASE_URL || "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL || "",
  ownerOpenId: process.env.OWNER_OPEN_ID || "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL || "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY || "",
};

// 로그인 기능 사용 시 필수 환경변수 검증
if (!ENV.appId) {
  console.warn("[ENV] WARNING: VITE_APP_ID or APP_ID not set. Email login may fail.");
}
if (!ENV.cookieSecret) {
  console.warn("[ENV] WARNING: JWT_SECRET not set. Session creation will fail.");
}
