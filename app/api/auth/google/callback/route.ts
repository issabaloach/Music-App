import { NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import jwt from 'jsonwebtoken';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');

    if (!code) {
      return NextResponse.redirect(new URL('/login?error=NoCodeProvided', request.url));
    }

    // Initialize the OAuth2 client
    const oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.NEXTAUTH_URL ? `${process.env.NEXTAUTH_URL}/api/auth/google/callback` : `${url.origin}/api/auth/google/callback`
    );

    // Exchange the authorization code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get user info using the access token
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    if (!userInfoResponse.ok) {
      throw new Error('Failed to fetch user info from Google');
    }

    const userData = await userInfoResponse.json();
    const { email, name, sub: googleId } = userData;

    if (!email) {
      return NextResponse.redirect(new URL('/login?error=NoEmailProvided', request.url));
    }

    await connectDB();

    // Find or create user
    let user = await User.findOne({ email });

    if (!user) {
      // Create a new user with Google credentials
      user = await User.create({
        name,
        email,
        googleId,
        password: await User.generateRandomPassword(), // Generate a random password for Google users
      });
    } else if (!user.googleId) {
      // Update existing user with Google ID if they didn't have one
      user.googleId = googleId;
      await user.save();
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Redirect to frontend with token
    const redirectUrl = new URL('/auth/callback', request.url);
    redirectUrl.searchParams.set('token', token);
    redirectUrl.searchParams.set('userId', user._id.toString());
    
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('Google auth error:', error);
    return NextResponse.redirect(new URL('/login?error=AuthFailed', request.url));
  }
}