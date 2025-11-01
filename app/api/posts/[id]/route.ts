import { getPostById, updatePost, deletePost } from '../../../controllers/posts-controller';

// We'll create a separate handler for post actions with ID
async function handlePostActionWithId(request: Request, postId: string) {
  // Lazy-load controller functions for action handling
  try {
    const body = await request.json();
    const { PostActionSchema } = await import('../../../schemas/post-schemas');
    
    const validationResult = PostActionSchema.safeParse(body);
    
    if (!validationResult.success) {
      return new Response(JSON.stringify({
        success: false,
        message: `Validation error: ${validationResult.error.issues.map(i => i.message).join(', ')}`,
        timestamp: new Date().toISOString()
      }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const action = validationResult.data;

    // Import the specific functions we need
    const { 
      likePost, 
      unlikePost, 
      commentOnPost, 
      favoritePost, 
      unfavoritePost 
    } = await import('../../../controllers/posts-controller');

    switch (action.action) {
      case 'like':
        return await likePost(action.content.userUuid, request, postId);
      case 'unlike':
        return await unlikePost(action.content.userUuid, request, postId);
      case 'comment':
        return await commentOnPost(action.content.userUuid, action.content.text, request, postId);
      case 'favorite':
        return await favoritePost(action.content.userUuid, request, postId);
      case 'unfavorite':
        return await unfavoritePost(action.content.userUuid, request, postId);
      default:
        return new Response(JSON.stringify({
          success: false,
          message: 'Invalid action for post interaction',
          timestamp: new Date().toISOString()
        }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: error instanceof Error ? error.message : 'Internal server error',
      timestamp: new Date().toISOString()
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return getPostById(request, id);
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return handlePostActionWithId(request, id);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return updatePost(request, id);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return deletePost(request, id);
}
