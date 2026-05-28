import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/auth/login
 * Very simple password check against ADMIN_PASSWORD.
 * Sets a non-httpOnly cookie for middleware (we can harden later).
 */
export async function POST(req: NextRequest) {
  const { password } = await req.json();

  const correct = process.env.ADMIN_PASSWORD || 'change-this-to-a-secure-password-123!';

  if (password === correct) {
    const res = NextResponse.json({ success: true });
    // 7 day cookie – long enough for staff use
    res.cookies.set('nhg_admin', 'true', {
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      sameSite: 'lax',
      // httpOnly: true would be better but then client JS can't easily read for UX. We can move to server-only checks.
    });
    return res;
  }

  return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
}
