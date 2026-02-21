export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

const getPublicOrigin = () => {
  const forced = import.meta.env.VITE_PUBLIC_ORIGIN;
  if (forced && forced.trim().length > 0) {
    return forced.replace(/\/$/, "");
  }
  const origin = window.location.origin;
  if (origin.startsWith("http://")) {
    return origin.replace("http://", "https://");
  }
  return origin;
};

export const getLoginUrl = () => {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  const appId = import.meta.env.VITE_APP_ID;
  
  // 환경변수 검증
  if (!oauthPortalUrl || !appId) {
    console.error("OAuth 환경변수가 설정되지 않았습니다.", {
      oauthPortalUrl,
      appId,
    });
    return "#";
  }
  
  const publicOrigin = getPublicOrigin();
  const redirectUri = `${publicOrigin}/api/oauth/callback`;
  
  // HTTPS 검증
  if (!redirectUri.startsWith("https://")) {
    console.error("redirectUri는 반드시 HTTPS여야 합니다:", redirectUri);
  }
  
  const state = btoa(redirectUri);
  const url = new URL(`${oauthPortalUrl}/app-auth`);
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");
  return url.toString();
};
