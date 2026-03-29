import { google } from 'googleapis';

// Env is loaded centrally via config/env.ts (first import in index.ts)

export const GMAIL_SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/userinfo.email',
];

/**
 * Creates a NEW OAuth2 client per call to avoid the shared-singleton race
 * condition where concurrent users overwrite each other's credentials.
 */
export const createGoogleOAuth2Client = () => {
  return new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    process.env.GMAIL_REDIRECT_URI
  );
};
