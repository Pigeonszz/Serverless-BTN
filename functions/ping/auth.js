// functions/ping/auth.js

import { initDatabase, getAuthentication } from "../d1.js";

export async function onRequest({ request, next, env }) {
  // 初始化数据库（检查并创建Authentication表）
  await initDatabase(env);

  // 获取鉴权头
  const authHeader = request.headers.get("Authentication");
  const xBtnAppId = request.headers.get("X-BTN-AppID");
  const xBtnAppSecret = request.headers.get("X-BTN-AppSecret");
  const btnAppId = request.headers.get("BTN-AppID");
  const btnAppSecret = request.headers.get("BTN-AppSecret");

  // 获取User-Agent头
  const userAgent = request.headers.get("User-Agent");

  // 验证鉴权头
  let appId, appSecret;
  if (authHeader) {
    const [scheme, credentials] = authHeader.split(" ");
    if (scheme === "Bearer") {
      [appId, appSecret] = credentials.split("@");
    }
  } else if (xBtnAppId && xBtnAppSecret) {
    appId = xBtnAppId;
    appSecret = xBtnAppSecret;
  } else if (btnAppId && btnAppSecret) {
    appId = btnAppId;
    appSecret = btnAppSecret;
  }

  if (appId && appSecret) {
    // 查询D1数据库中的Authentication表
    const results = await getAuthentication(env, appId, appSecret);

    if (results.length > 0) {
      // 检查User-Agent头中是否包含BTN-Protocol
      if (userAgent && userAgent.includes("BTN-Protocol")) {
        return await next();
      } else {
        return new Response(JSON.stringify({ error: "Missing BTN-Protocol in User-Agent header" }), {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        });
      }
    }
  }

  // 如果鉴权失败，返回401 Unauthorized
  return new Response(JSON.stringify({ error: "Unauthorized" }), {
    status: 401,
    headers: {
      "Content-Type": "application/json",
    },
  });
}