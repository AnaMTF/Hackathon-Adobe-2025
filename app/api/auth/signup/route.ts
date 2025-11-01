import { NextRequest, NextResponse } from 'next/server';
import { User } from '../../../models/user-model';
import { ensureDbReady } from '../../../../lib/database';
import { hashPassword, generateToken, setAuthCookie } from '../../../../lib/auth';
import { processImageFromBase64 } from '../../../../lib/image-processing';
import { z } from 'zod';

// Force Node.js runtime for this route
export const runtime = 'nodejs';

// Validation schema for signup
const SignupSchema = z.object({
  numeFullName: z.string().min(1, 'Full name is required').max(100),
  email: z.string().email('Invalid email format'),
  parola: z.string().min(6, 'Password must be at least 6 characters'),
  departament: z.string().min(1, 'Department is required').max(100),
  jobTitle: z.string().min(1, 'Job title is required').max(100),
  poza: z.string().optional().or(z.literal('')), // Base64 image data
  telefon: z.string().regex(/^[+]?[\d\s-().]*$/).optional().or(z.literal('')),
  location: z.string().max(255).optional().or(z.literal('')),
});

export async function POST(request: NextRequest) {
  try {
    await ensureDbReady();
    
    const body = await request.json();
    
    // Validate request body
    const validationResult = SignupSchema.safeParse(body);
    
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

    const data = validationResult.data;

    // Check if user with this email already exists
    const existingUser = await User.findOne({ where: { email: data.email } });
    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: 'A user with this email already exists',
        },
        { status: 409 }
      );
    }

    // Hash the password
    const hashedPassword = await hashPassword(data.parola);

    // Process profile picture if provided
    let processedImage: string | undefined = undefined;
    if (data.poza && data.poza.startsWith('data:image')) {
      try {
        // Optimize image: resize to 400px width, 80% quality
        processedImage = await processImageFromBase64(data.poza, 400, 80);
      } catch (error) {
        console.error('Image processing failed:', error);
        // Continue without image if processing fails
      }
    }

    // Create the user
    const user = await User.create({
      numeFullName: data.numeFullName,
      email: data.email,
      parola: hashedPassword,
      departament: data.departament,
      jobTitle: data.jobTitle,
      poza: processedImage,
      telefon: data.telefon || undefined,
      location: data.location || undefined,
    });

    console.log('[signup] User created:', {
      uuid: user.uuid,
      email: user.email,
      numeFullName: user.numeFullName,
      hasUuid: !!user.uuid,
      uuidType: typeof user.uuid
    });

    // Ensure UUID exists
    if (!user.uuid) {
      throw new Error('User UUID was not generated');
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.uuid,
      email: user.email,
    });

    console.log('[signup] Token generated, setting cookie');

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
        message: 'Account created successfully',
        data: {
          user: userResponse,
          token,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
