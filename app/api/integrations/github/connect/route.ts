import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getAuthOptions } from '@/app/api/auth/[...nextauth]/authOptions';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(getAuthOptions());
    if (!session?.user?.id) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    const clientId = process.env.GITHUB_CLIENT_ID;
    if (!clientId) {
      return NextResponse.json(
        { error: 'GitHub integration not configured' },
        { status: 500 }
      );
    }

    // Generate state parameter for security
    const state = Buffer.from(JSON.stringify({ userId: session.user.id })).toString('base64');
    const callbackUrl = `${process.env.NEXTAUTH_URL}/api/integrations/github/callback`;

    // GitHub OAuth authorization URL
    const githubAuthUrl = new URL('https://github.com/login/oauth/authorize');
    githubAuthUrl.searchParams.set('client_id', clientId);
    githubAuthUrl.searchParams.set('redirect_uri', callbackUrl);
    githubAuthUrl.searchParams.set('scope', 'repo read:user');
    githubAuthUrl.searchParams.set('state', state);
    githubAuthUrl.searchParams.set('allow_signup', 'false');

    return NextResponse.redirect(githubAuthUrl.toString());
  } catch (error) {
    console.error('GitHub connect error:', error);
    return NextResponse.json({ error: 'Failed to initiate GitHub OAuth' }, { status: 500 });
  }
}
