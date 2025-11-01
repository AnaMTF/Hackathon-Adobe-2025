import { NextResponse } from 'next/server';
import { getCurrentUser } from '../../../../lib/auth';
import { User } from '../../../models/user-model';
import { ensureDbReady } from '../../../../lib/database';

export async function GET() {
  try {
    await ensureDbReady();
    
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          message: 'Not authenticated',
        },
        { status: 401 }
      );
    }

    // Fetch full user details from database
    const user = await User.findByPk(currentUser.userId, {
      attributes: { exclude: ['parola'] },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'User not found',
        },
        { status: 404 }
      );
    }

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
    console.error('Me route error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
