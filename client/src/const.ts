export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

const getPublicOrigin = () => {
  const forced = import.meta.env.VITE_PUBLIC_ORIGIN;
  if (forced && forced.trim().length > 0) {
    return forced.replace(/\/$/, "");
  }
  // 현재 도메인이 http로 시작하면 강제로 https로 변환
  const origin = window.location.origin;
  if (origin.startsWith("http://")) {
    return origin.replace("http://", "https://");
  }
  return origin;
};

export const getLoginUrl = () => {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  const appId = import.meta.env.VITE_APP_ID;
  const publicOrigin = getPublicOrigin();
  const redirectUri = `${publicOrigin}/api/oauth/callback`;
  const state = btoa(redirectUri);
  const url = new URL(`${oauthPortalUrl}/app-auth`);
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");
  return url.toString();
};
