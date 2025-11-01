import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '../../../../lib/auth';
import { User } from '../../../models/user-model';
import { ensureDbReady } from '../../../../lib/database';

// Force Node.js runtime for this route
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  console.log('[/api/auth/me] === ROUTE HANDLER CALLED ===');
  
  try {
    console.log('[/api/auth/me] Ensuring database is ready...');
    await ensureDbReady();
    console.log('[/api/auth/me] Database ready');
    
    console.log('[/api/auth/me] Getting current user...');
    const currentUser = await getCurrentUser();
    console.log('[/api/auth/me] Current user from token:', JSON.stringify(currentUser, null, 2));
    
    if (!currentUser) {
      console.log('[/api/auth/me] No authenticated user found');
      return NextResponse.json(
        {
          success: false,
          message: 'Not authenticated',
        },
        { status: 401 }
      );
    }

    // Check if token has userId
    if (!currentUser.userId) {
      console.log('[/api/auth/me] Token missing userId - old token format. User needs to log in again.');
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid token format. Please log in again.',
        },
        { status: 401 }
      );
    }

    // Fetch full user details from database
    console.log('[/api/auth/me] Fetching user with userId:', currentUser.userId);
    const user = await User.findByPk(currentUser.userId, {
      attributes: { exclude: ['parola'] },
    });
    console.log('[/api/auth/me] User found:', user ? 'yes' : 'no');

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'User not found',
        },
        { status: 404 }
      );
    }

    console.log('[/api/auth/me] Returning user data');
    return NextResponse.json(
      {
        success: true,
        message: 'User authenticated',
        data: {
          user: user.toJSON(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[/api/auth/me] Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
