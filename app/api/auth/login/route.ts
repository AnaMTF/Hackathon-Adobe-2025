import { NextRequest, NextResponse } from 'next/server';
import { User } from '../../../models/user-model';
import { ensureDbReady } from '../../../../lib/database';
import { comparePassword, generateToken, setAuthCookie } from '../../../../lib/auth';
import { z } from 'zod';

// Force Node.js runtime for this route
export const runtime = 'nodejs';

// Validation schema for login
const LoginSchema = z.object({
  email: z.string().email('Invalid email format'),
  parola: z.string().min(1, 'Password is required'),
});

export async function POST(request: NextRequest) {
  try {
    await ensureDbReady();
    
    const body = await request.json();
    
    // Validate request body
    const validationResult = LoginSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation error',
          errors: validationResult.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        },
        { status: 400 }
      );
    }

    const { email, parola } = validationResult.data;

    // Find user by email
    const user = await User.findOne({ where: { email } });
    
    console.log('[login] User found:', !!user);
    console.log('[login] User data:', user ? {
      uuid: user.uuid,
      email: user.email,
      hasPassword: !!user.parola,
      passwordLength: user.parola?.length
    } : 'none');
    
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid email or password',
        },
        { status: 401 }
      );
    }

    if (!user.parola) {
      console.error('[login] User has no password hash!');
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid email or password',
        },
        { status: 401 }
      );
    }

    // Verify password
    console.log('[login] Comparing password...');
    const isPasswordValid = await comparePassword(parola, user.parola);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid email or password',
        },
        { status: 401 }
      );
    }

    // Update user status to online and lastSeen
    await user.update({
      status: 'online',
      lastSeen: new Date(),
    });

    // Generate JWT token
    const token = generateToken({
      userId: user.uuid,
      email: user.email,
    });

    // Set auth cookie
    await setAuthCookie(token);

    // Prepare response without password
    const userResponse = {
      uuid: user.uuid,
      numeFullName: user.numeFullName,
      email: user.email,
      departament: user.departament,
      jobTitle: user.jobTitle,
      poza: user.poza,
      telefon: user.telefon,
      location: user.location,
      createdAt: user.createdAt,
    };

    return NextResponse.json(
      {
        success: true,
        message: 'Login successful',
        data: {
          user: userResponse,
          token,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
