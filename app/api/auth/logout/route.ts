import { NextResponse } from 'next/server';
import { removeAuthCookie, getCurrentUser } from '../../../../lib/auth';
import { User } from '../../../models/user-model';
import { ensureDbReady } from '../../../../lib/database';

export async function POST() {
  try {
    // Get current user before removing cookie
    const currentUser = await getCurrentUser();
    
    // Update user status to offline if we have a user
    if (currentUser?.userId) {
      try {
        await ensureDbReady();
        const user = await User.findByPk(currentUser.userId);
        if (user) {
          await user.update({
            status: 'offline',
            lastSeen: new Date(),
          });
        }
      } catch (error) {
        console.error('Failed to update user status on logout:', error);
        // Continue with logout even if status update fails
      }
    }
    
    await removeAuthCookie();
    
    return NextResponse.json(
      {
        success: true,
        message: 'Logged out successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
