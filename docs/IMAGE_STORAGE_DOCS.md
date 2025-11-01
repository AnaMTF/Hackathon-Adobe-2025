# Image Storage and Processing Documentation

## Overview
The application stores images directly in the database as base64-encoded strings. All images are automatically optimized using Sharp to reduce file size and converted to WebP format before storage.

## Features
- ✅ Base64 image storage in SQLite database
- ✅ Automatic image optimization with Sharp
- ✅ WebP conversion for better compression
- ✅ Client-side image preview
- ✅ Configurable quality and size settings
- ✅ Support for profile pictures and post images

## Image Processing Flow

### 1. User Uploads Image
```typescript
// Client-side: Convert File to base64
const reader = new FileReader();
reader.onloadend = () => {
  const base64String = reader.result as string;
  // base64String is now "data:image/jpeg;base64,/9j/4AAQ..."
};
reader.readAsDataURL(file);
```

### 2. Server-Side Processing
```typescript
// Server automatically optimizes the image
import { processImageFromBase64 } from '@/lib/image-processing';

const optimizedImage = await processImageFromBase64(
  base64String,
  800,  // max width in pixels
  80    // quality (1-100)
);
// Returns: "data:image/webp;base64,UklGRiQAAABX..."
```

### 3. Storage in Database
Images are stored as TEXT fields in SQLite:
- **Profile pictures**: 400px max width, 80% quality
- **Post images**: 1200px max width, 85% quality

## Image Processing Functions

### `processImageFile(file, maxWidth?, quality?)`
Processes a File object from form input.

**Parameters:**
- `file`: File object from `<input type="file">`
- `maxWidth`: Maximum width in pixels (default: 800)
- `quality`: WebP quality 1-100 (default: 80)

**Returns:** Base64 string with data URI prefix

**Example:**
```typescript
const file = event.target.files[0];
const processedImage = await processImageFile(file, 1200, 85);
```

### `processImageFromBase64(dataUrl, maxWidth?, quality?)`
Re-processes an already uploaded image.

**Parameters:**
- `dataUrl`: Base64 data URL (e.g., "data:image/jpeg;base64,...")
- `maxWidth`: Maximum width in pixels (default: 800)
- `quality`: WebP quality 1-100 (default: 80)

**Returns:** Base64 string with data URI prefix

**Example:**
```typescript
const optimized = await processImageFromBase64(
  'data:image/jpeg;base64,...',
  400,
  80
);
```

### `isValidImageType(file)`
Validates if the file is a supported image type.

**Supported types:**
- image/jpeg
- image/jpg
- image/png
- image/gif
- image/webp

### `isValidImageSize(file, maxSizeMB?)`
Validates if the file size is within limits (default: 10MB).

## Database Schema Changes

### User Model
```typescript
poza: {
  type: DataTypes.TEXT,  // Changed from STRING
  allowNull: true,
  // No URL validation - stores base64
}
```

### Post Model
```typescript
poze: {
  type: DataTypes.JSON,
  allowNull: false,
  defaultValue: [],
  validate: {
    isValidPhotos(value: string[]) {
      // Validates base64 data URLs
      value.forEach(item => {
        if (item && !item.startsWith('data:image')) {
          throw new Error('Must be a valid base64 data URL');
        }
      });
    }
  }
}
```

## API Endpoints

### POST /api/auth/signup
Now accepts base64 profile pictures.

**Request:**
```json
{
  "numeFullName": "John Doe",
  "email": "john@xiat.com",
  "parola": "password",
  "poza": "data:image/jpeg;base64,/9j/4AAQ...",
  ...
}
```

### POST /api/process-image
Standalone endpoint for image optimization.

**Request:**
```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQ...",
  "maxWidth": 800,    // optional
  "quality": 80       // optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Image processed successfully",
  "data": {
    "image": "data:image/webp;base64,UklGRiQA..."
  }
}
```

### POST /api/posts (with images)
Now accepts base64 images in the poze array.

**Request:**
```json
{
  "action": "create",
  "content": {
    "authorUuid": "...",
    "text": "Check out this photo!",
    "poze": [
      "data:image/jpeg;base64,/9j/4AAQ...",
      "data:image/png;base64,iVBORw0KG..."
    ]
  }
}
```

## Client-Side Implementation

### Registration Form (Profile Picture)
```tsx
const [profileBase64, setProfileBase64] = useState<string | null>(null);

const handleFile = async (file: File) => {
  // Validate
  if (!isValidImageType(file)) {
    setError('Invalid image type');
    return;
  }
  
  if (!isValidImageSize(file, 10)) {
    setError('Image too large (max 10MB)');
    return;
  }

  // Convert to base64
  const reader = new FileReader();
  reader.onloadend = () => {
    setProfileBase64(reader.result as string);
  };
  reader.readAsDataURL(file);
};

// In form submit
const response = await fetch('/api/auth/signup', {
  method: 'POST',
  body: JSON.stringify({
    ...userData,
    poza: profileBase64 // Send base64 string
  })
});
```

### Displaying Base64 Images
```tsx
// In React components
{user.poza && (
  <img 
    src={user.poza} 
    alt="Profile" 
    className="rounded-full"
  />
)}

// Or with Next.js Image (using unoptimized since it's already optimized)
<Image 
  src={user.poza || '/default-avatar.png'} 
  alt="Profile"
  width={100}
  height={100}
  unoptimized
/>
```

## Performance Considerations

### Image Size Optimization
- **Profile pictures**: 400px × 400px average
  - Original JPEG (2MB) → WebP base64 (~50-100KB)
- **Post images**: 1200px width
  - Original JPEG (5MB) → WebP base64 (~200-400KB)

### Database Impact
- Base64 encoding increases size by ~33%
- WebP compression reduces original size by 70-80%
- Net result: Similar or smaller than original

### Best Practices
1. **Client-side validation**: Check file type and size before upload
2. **Server-side processing**: Always optimize images on the server
3. **Lazy loading**: Load images only when needed
4. **Caching**: Browser caches base64 images automatically

## Migration from URL-based Storage

If you have existing data with URLs, create a migration script:

```typescript
import { User, Post } from './models';
import { processImageFromBase64 } from './lib/image-processing';
import fetch from 'node-fetch';

async function migrateImages() {
  // Migrate user profile pictures
  const users = await User.findAll();
  
  for (const user of users) {
    if (user.poza && user.poza.startsWith('http')) {
      try {
        // Fetch image from URL
        const response = await fetch(user.poza);
        const buffer = await response.buffer();
        const base64 = buffer.toString('base64');
        const dataUrl = `data:image/jpeg;base64,${base64}`;
        
        // Optimize and update
        const optimized = await processImageFromBase64(dataUrl, 400, 80);
        await user.update({ poza: optimized });
        
        console.log(`Migrated user ${user.uuid}`);
      } catch (error) {
        console.error(`Failed to migrate user ${user.uuid}:`, error);
      }
    }
  }
  
  // Similar process for posts...
}
```

## Troubleshooting

### "Image too large" errors
- Increase max payload size in Next.js config:
  ```javascript
  // next.config.js
  module.exports = {
    api: {
      bodyParser: {
        sizeLimit: '10mb'
      }
    }
  }
  ```

### Sharp installation issues
- Ensure native dependencies are installed:
  ```bash
  npm rebuild sharp
  ```

### SQLite TEXT field limits
- SQLite TEXT fields can store up to ~1GB
- Typical optimized images: 50KB-500KB in base64
- No practical limit for normal use cases

## Example: Complete Image Upload Flow

```typescript
// Component
function ImageUploader() {
  const [image, setImage] = useState<string | null>(null);
  
  const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate
    if (!isValidImageType(file)) {
      alert('Invalid image type');
      return;
    }
    
    if (!isValidImageSize(file, 10)) {
      alert('Image must be less than 10MB');
      return;
    }
    
    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      
      // Optionally process client-side or send to server
      const response = await fetch('/api/process-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64, maxWidth: 800, quality: 80 })
      });
      
      const data = await response.json();
      setImage(data.data.image);
    };
    
    reader.readAsDataURL(file);
  };
  
  return (
    <div>
      <input type="file" accept="image/*" onChange={handleUpload} />
      {image && <img src={image} alt="Preview" />}
    </div>
  );
}
```

## Security Considerations

1. **Validate MIME types**: Check magic bytes, not just extensions
2. **Limit file sizes**: Enforce reasonable limits (10MB default)
3. **Sanitize filenames**: Don't store or use original filenames
4. **Rate limiting**: Prevent abuse of image upload endpoints
5. **Content scanning**: Consider scanning for malicious content

## Future Enhancements

- [ ] Add image cropping functionality
- [ ] Support for multiple image formats (AVIF, etc.)
- [ ] CDN integration for large-scale deployments
- [ ] Image thumbnail generation
- [ ] Client-side compression before upload
- [ ] Progressive image loading
