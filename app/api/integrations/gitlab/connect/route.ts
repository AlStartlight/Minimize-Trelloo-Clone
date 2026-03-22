import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getAuthOptions } from '@/app/api/auth/[...nextauth]/authOptions';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(getAuthOptions());
    if (!session?.user?.id) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    const clientId = process.env.GITLAB_CLIENT_ID;
    if (!clientId) {
      return NextResponse.json(
        { error: 'GitLab integration not configured' },
        { status: 500 }
      );
    }

    // Generate state parameter for security
    const state = Buffer.from(JSON.stringify({ userId: session.user.id })).toString('base64');
    const callbackUrl = `${process.env.NEXTAUTH_URL}/api/integrations/gitlab/callback`;

    // GitLab OAuth authorization URL
    const gitlabAuthUrl = new URL('https://gitlab.com/oauth/authorize');
    gitlabAuthUrl.searchParams.set('client_id', clientId);
    gitlabAuthUrl.searchParams.set('redirect_uri', callbackUrl);
    gitlabAuthUrl.searchParams.set('response_type', 'code');
    gitlabAuthUrl.searchParams.set('scope', 'api read_user');
    gitlabAuthUrl.searchParams.set('state', state);

    return NextResponse.redirect(gitlabAuthUrl.toString());
  } catch (error) {
    console.error('GitLab connect error:', error);
    return NextResponse.json({ error: 'Failed to initiate GitLab OAuth' }, { status: 500 });
  }
}
