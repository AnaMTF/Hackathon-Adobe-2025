import sharp from 'sharp';

/**
 * Process and optimize an image file
 * Converts to WebP format, resizes, and returns as base64 string
 * 
 * @param file - File object from form input
 * @param maxWidth - Maximum width in pixels (default: 800)
 * @param quality - WebP quality 1-100 (default: 80)
 * @returns Base64 string with data URI prefix
 */
export async function processImageFile(
  file: File,
  maxWidth: number = 800,
  quality: number = 80
): Promise<string> {
  try {
    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Process image with Sharp
    const processedBuffer = await sharp(buffer)
      .resize(maxWidth, null, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality })
      .toBuffer();

    // Convert to base64
    const base64 = processedBuffer.toString('base64');
    
    // Return with data URI prefix
    return `data:image/webp;base64,${base64}`;
  } catch (error) {
    console.error('Error processing image:', error);
    throw new Error('Failed to process image');
  }
}

/**
 * Process an image from base64 or data URL
 * Useful for re-processing already uploaded images
 * 
 * @param dataUrl - Base64 data URL or plain base64 string
 * @param maxWidth - Maximum width in pixels (default: 800)
 * @param quality - WebP quality 1-100 (default: 80)
 * @returns Base64 string with data URI prefix
 */
export async function processImageFromBase64(
  dataUrl: string,
  maxWidth: number = 800,
  quality: number = 80
): Promise<string> {
  try {
    // Remove data URI prefix if present
    const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Process with Sharp
    const processedBuffer = await sharp(buffer)
      .resize(maxWidth, null, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality })
      .toBuffer();

    // Convert to base64
    const base64 = processedBuffer.toString('base64');
    
    return `data:image/webp;base64,${base64}`;
  } catch (error) {
    console.error('Error processing base64 image:', error);
    throw new Error('Failed to process image');
  }
}

/**
 * Validate image file type
 */
export function isValidImageType(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  return validTypes.includes(file.type);
}

/**
 * Validate image file size (in bytes)
 */
export function isValidImageSize(file: File, maxSizeMB: number = 10): boolean {
  const maxBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxBytes;
}
