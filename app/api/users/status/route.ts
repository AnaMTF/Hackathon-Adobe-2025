import { NextRequest } from 'next/server';
import { getCurrentUser } from '../../../../lib/auth';
import { updateUserStatus, updateUserHeartbeat } from '../../../controllers/users-controller';

// Force Node.js runtime
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// PUT /api/users/status - Update current user's status
export async function PUT(request: NextRequest) {
  console.log('[/api/users/status PUT] Request received');
  try {
    const currentUser = await getCurrentUser();
    console.log('[/api/users/status PUT] Current user:', currentUser);
    
    if (!currentUser?.userId) {
      console.log('[/api/users/status PUT] Unauthorized - no user');
      return new Response(JSON.stringify({
        success: false,
        message: 'Unauthorized',
      }), { status: 401 });
    }

    const body = await request.json();
    console.log('[/api/users/status PUT] Request body:', body);
    const { status } = body;

    if (!status || !['online', 'away', 'busy', 'offline'].includes(status)) {
      console.log('[/api/users/status PUT] Invalid status:', status);
      return new Response(JSON.stringify({
        success: false,
        message: 'Invalid status. Must be one of: online, away, busy, offline',
      }), { status: 400 });
    }

    console.log('[/api/users/status PUT] Calling updateUserStatus with userId:', currentUser.userId, 'status:', status);
    const result = await updateUserStatus(currentUser.userId, status);
    console.log('[/api/users/status PUT] Result:', result);
    return result;
  } catch (error) {
    console.error('[/api/users/status] Error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: error instanceof Error ? error.message : 'Internal server error',
    }), { status: 500 });
  }
}

// POST /api/users/status/heartbeat - Update user's last seen timestamp
export async function POST() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser?.userId) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Unauthorized',
      }), { status: 401 });
    }

    return await updateUserHeartbeat(currentUser.userId);
  } catch (error) {
    console.error('[/api/users/status/heartbeat] Error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: error instanceof Error ? error.message : 'Internal server error',
    }), { status: 500 });
  }
}
