import { NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const redirectUri = process.env.NEXTAUTH_URL 
      ? `${process.env.NEXTAUTH_URL}/api/auth/google/callback` 
      : `${url.origin}/api/auth/google/callback`;

    const oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      redirectUri
    );

    // Generate the Google OAuth URL
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
      ],
      prompt: 'consent',
    });

    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Google auth initialization error:', error);
    return NextResponse.redirect(new URL('/login?error=AuthInitFailed', request.url));
  }
}