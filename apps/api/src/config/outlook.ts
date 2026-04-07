import axios from 'axios';

// Env is loaded centrally via config/env.ts (first import in index.ts)

export const OUTLOOK_AUTH_URL = `https://login.microsoftonline.com/${process.env.OUTLOOK_TENANT_ID}/oauth2/v2.0/authorize`;
export const OUTLOOK_TOKEN_URL = `https://login.microsoftonline.com/${process.env.OUTLOOK_TENANT_ID}/oauth2/v2.0/token`;

export const OUTLOOK_SCOPES = 'openid email Mail.Read Mail.Send offline_access';

export const refreshOutlookToken = async (refreshToken: string) => {
  const response = await axios.post(
    OUTLOOK_TOKEN_URL,
    new URLSearchParams({
      client_id: process.env.OUTLOOK_CLIENT_ID || '',
      client_secret: process.env.OUTLOOK_CLIENT_SECRET || '',
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
      scope: OUTLOOK_SCOPES,
    }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );

  return response.data;
};
