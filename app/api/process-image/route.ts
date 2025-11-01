import { NextRequest, NextResponse } from 'next/server';
import { processImageFromBase64 } from '../../../lib/image-processing';

/**
 * POST /api/process-image
 * 
 * Processes a base64 image and returns an optimized version
 * Request body: { image: string, maxWidth?: number, quality?: number }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.image || typeof body.image !== 'string') {
      return NextResponse.json(
        {
          success: false,
          message: 'Image data is required',
        },
        { status: 400 }
      );
    }

    // Validate it's a base64 image
    if (!body.image.startsWith('data:image')) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid image format. Must be a base64 data URL',
        },
        { status: 400 }
      );
    }

    const maxWidth = body.maxWidth || 800;
    const quality = body.quality || 80;

    // Process the image
    const processedImage = await processImageFromBase64(
      body.image,
      maxWidth,
      quality
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Image processed successfully',
        data: {
          image: processedImage,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Image processing error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to process image',
      },
      { status: 500 }
    );
  }
}
