const crypto = require("crypto");
const { env, hasFirebaseAdmin } = require("../config/env");

let cachedAccessToken = null;

function base64Url(value) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function signJwt() {
  const now = Math.floor(Date.now() / 1000);
  const header = base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = base64Url(JSON.stringify({
    iss: env.firebase.clientEmail,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600
  }));

  const signer = crypto.createSign("RSA-SHA256");
  signer.update(`${header}.${claim}`);
  signer.end();
  const signature = signer.sign(env.firebase.privateKey, "base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

  return `${header}.${claim}.${signature}`;
}

async function getAccessToken() {
  if (cachedAccessToken && cachedAccessToken.expiresAt > Date.now() + 60000) {
    return cachedAccessToken.token;
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: signJwt()
    })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Firebase token request failed: ${body}`);
  }

  const data = await response.json();
  cachedAccessToken = {
    token: data.access_token,
    expiresAt: Date.now() + Number(data.expires_in || 3600) * 1000
  };

  return cachedAccessToken.token;
}

async function sendWebPush({ tokens, title, body }) {
  if (!hasFirebaseAdmin()) {
    return { configured: false, successCount: 0, failureCount: 0 };
  }

  const accessToken = await getAccessToken();
  const url = `https://fcm.googleapis.com/v1/projects/${env.firebase.projectId}/messages:send`;
  const results = await Promise.all(tokens.map(async (token) => {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: {
          token,
          notification: { title, body },
          webpush: {
            fcm_options: { link: "/" },
            notification: {
              icon: "/fav.png",
              badge: "/fav.png"
            }
          }
        }
      })
    });

    return {
      ok: response.ok,
      body: response.ok ? await response.json() : await response.text()
    };
  }));

  return {
    configured: true,
    successCount: results.filter((result) => result.ok).length,
    failureCount: results.filter((result) => !result.ok).length,
    results
  };
}

module.exports = { sendWebPush };
