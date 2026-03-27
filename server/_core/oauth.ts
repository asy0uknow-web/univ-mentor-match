import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

export function registerOAuthRoutes(app: Express) {
  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }

    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);

      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }

      // 이메일 기반 계정 통합: 같은 이메일로 기존 계정이 있으면 그 계정 사용
      if (userInfo.email) {
        const existingUser = await db.getUserByEmail(userInfo.email);
        if (existingUser) {
          console.log(`[OAuth] Existing user found with email ${userInfo.email}, updating loginMethod to ${userInfo.loginMethod || userInfo.platform}`);
          
          // 기존 계정의 openId와 loginMethod 업데이트
          await db.updateUserOAuthInfo(existingUser.id, userInfo.openId, userInfo.loginMethod ?? userInfo.platform ?? null);
          
          const sessionToken = await sdk.createSessionToken(userInfo.openId, {
            name: existingUser.name || "",
            expiresInMs: ONE_YEAR_MS,
          });

          const cookieOptions = getSessionCookieOptions(req);
          res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

          res.redirect(302, `/?t=${Date.now()}`);
          return;
        }
      }

      // 새 계정 생성
      await db.upsertUser({
        openId: userInfo.openId,
        name: null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: new Date(),
      });

      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.redirect(302, `/?t=${Date.now()}`);
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}
