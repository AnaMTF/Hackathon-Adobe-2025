import { Post } from '../models/post-model';
import { User } from '../models/user-model';
import { PostLike, PostComment, PostFavorite } from '../models/post-interactions';
import { ensureDbReady } from '../../lib/database';
import { processImageFromBase64 } from '../../lib/image-processing';
import { Op } from 'sequelize';
import { PostActionSchema } from '../schemas/post-schemas';

// Do not auto-initialize at module load to avoid races; await ensureDbReady() inside handlers

// Helper function to create standardized API responses
function createResponse(data: unknown, status: number = 200, message?: string) {
  return new Response(JSON.stringify({
    success: status < 400,
    message,
    data,
    timestamp: new Date().toISOString()
  }), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

// Helper function to handle errors
function createErrorResponse(error: unknown, status: number = 500) {
  console.error('Controller Error:', error);
  const message = error instanceof Error ? error.message : 'Internal server error';
  return createResponse(null, status, message);
}

// GET /api/posts - Get all posts
export async function getAllPosts(request: Request) {
  try {
    await ensureDbReady();
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const authorUuid = url.searchParams.get('author');
    const offset = (page - 1) * limit;

    const whereClause: Record<string, unknown> = {};
    if (authorUuid) {
      whereClause.authorUuid = authorUuid;
    }

    const posts = await Post.findAndCountAll({
      where: whereClause,
      include: [{
        model: User,
        as: 'author',
        attributes: { exclude: ['parola'] }, // Don't include password
      }],
      limit,
      offset,
      order: [['timestamp', 'DESC']],
    });

    return createResponse({
      posts: posts.rows,
      pagination: {
        page,
        limit,
        total: posts.count,
        pages: Math.ceil(posts.count / limit),
      }
    }, 200, 'Posts retrieved successfully');
  } catch (error) {
    return createErrorResponse(error);
  }
}

// POST /api/posts - Handle post actions (create, like, comment, favorite, etc.)
export async function handlePostAction(request: Request) {
  try {
    await ensureDbReady();
    const body = await request.json();
    
    // Validate request body against schema
    const validationResult = PostActionSchema.safeParse(body);
    
    if (!validationResult.success) {
      return createErrorResponse(
        new Error(`Validation error: ${validationResult.error.issues.map(i => i.message).join(', ')}`),
        400
      );
    }

    const action = validationResult.data;

    switch (action.action) {
      case 'create':
        return await createPostInternal(action.content);
      case 'like':
        return await likePost(action.content.userUuid, request);
      case 'unlike':
        return await unlikePost(action.content.userUuid, request);
      case 'comment':
        return await commentOnPost(action.content.userUuid, action.content.text, request);
      case 'favorite':
        return await favoritePost(action.content.userUuid, request);
      case 'unfavorite':
        return await unfavoritePost(action.content.userUuid, request);
      case 'update':
        return createErrorResponse(
          new Error('Update action should be sent to PUT /api/posts/[id]'),
          400
        );
      case 'delete':
        return createErrorResponse(
          new Error('Delete action should be sent to DELETE /api/posts/[id]'),
          400
        );
      default:
        return createErrorResponse(new Error('Invalid action'), 400);
    }
  } catch (error) {
    if (error instanceof SyntaxError) {
      return createErrorResponse(new Error('Invalid JSON'), 400);
    }
    return createErrorResponse(error);
  }
}

// Internal function to create post
async function createPostInternal(content: {
  authorUuid: string;
  text: string;
  poze?: string[];
  tags?: string[];
  event?: { location: string; time: string | Date };
}) {
  try {
    // Verify author exists
    const author = await User.findByPk(content.authorUuid);
    if (!author) {
      return createErrorResponse(
        new Error('Author not found'),
        404
      );
    }

    // Process images if provided
    let processedImages: string[] = [];
    if (content.poze && content.poze.length > 0) {
      processedImages = await Promise.all(
        content.poze.map(async (image) => {
          if (image && image.startsWith('data:image')) {
            try {
              // Optimize images: resize to 1200px width, 85% quality for posts
              return await processImageFromBase64(image, 1200, 85);
            } catch (error) {
              console.error('Image processing failed:', error);
              // Return original if processing fails
              return image;
            }
          }
          return image;
        })
      );
    }

    // Set default values and convert date if needed
    const postData = {
      ...content,
      poze: processedImages,
      tags: content.tags || [],
      timestamp: new Date(),
      event: content.event ? {
        ...content.event,
        time: typeof content.event.time === 'string' ? new Date(content.event.time) : content.event.time
      } : undefined,
    };

    const post = await Post.create(postData);
    
    // Fetch the created post with author information
    const createdPost = await Post.findByPk(post.uuid, {
      include: [{
        model: User,
        as: 'author',
        attributes: { exclude: ['parola'] },
      }],
    });

    return createResponse(createdPost, 201, 'Post created successfully');
  } catch (error) {
    if (error instanceof Error && error.name === 'SequelizeValidationError') {
      return createErrorResponse(error, 400);
    }
    return createErrorResponse(error);
  }
}

// Helper function to get post ID from request URL or context
function getPostIdFromContext(request: Request, postId?: string): string | null {
  if (postId) {
    return postId;
  }
  
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/');
  const extractedId = pathParts[pathParts.length - 1];
  return extractedId && extractedId !== 'posts' ? extractedId : null;
}

// Like a post
export async function likePost(userUuid: string, request: Request, postId?: string) {
  try {
    const extractedPostId = getPostIdFromContext(request, postId);
    if (!extractedPostId) {
      return createErrorResponse(new Error('Post ID is required'), 400);
    }

    // Check if post exists
    const post = await Post.findByPk(extractedPostId);
    if (!post) {
      return createErrorResponse(new Error('Post not found'), 404);
    }

    // Check if user exists
    const user = await User.findByPk(userUuid);
    if (!user) {
      return createErrorResponse(new Error('User not found'), 404);
    }

    // Check if already liked
    const existingLike = await PostLike.findOne({
      where: { postUuid: extractedPostId, userUuid }
    });

    if (existingLike) {
      return createErrorResponse(new Error('Post already liked'), 409);
    }

    // Create like
    await PostLike.create({ postUuid: extractedPostId, userUuid });

    return createResponse(null, 200, 'Post liked successfully');
  } catch (error) {
    return createErrorResponse(error);
  }
}

// Unlike a post
export async function unlikePost(userUuid: string, request: Request, postId?: string) {
  try {
    const extractedPostId = getPostIdFromContext(request, postId);
    if (!extractedPostId) {
      return createErrorResponse(new Error('Post ID is required'), 400);
    }

    // Find and remove like
    const like = await PostLike.findOne({
      where: { postUuid: extractedPostId, userUuid }
    });

    if (!like) {
      return createErrorResponse(new Error('Like not found'), 404);
    }

    await like.destroy();

    return createResponse(null, 200, 'Post unliked successfully');
  } catch (error) {
    return createErrorResponse(error);
  }
}

// Comment on a post
export async function commentOnPost(userUuid: string, text: string, request: Request, postId?: string) {
  try {
    const extractedPostId = getPostIdFromContext(request, postId);
    if (!extractedPostId) {
      return createErrorResponse(new Error('Post ID is required'), 400);
    }

    // Check if post exists
    const post = await Post.findByPk(extractedPostId);
    if (!post) {
      return createErrorResponse(new Error('Post not found'), 404);
    }

    // Check if user exists
    const user = await User.findByPk(userUuid);
    if (!user) {
      return createErrorResponse(new Error('User not found'), 404);
    }

    // Create comment
    const comment = await PostComment.create({
      postUuid: extractedPostId,
      userUuid,
      text
    });

    return createResponse(comment, 201, 'Comment added successfully');
  } catch (error) {
    return createErrorResponse(error);
  }
}

// Favorite a post
export async function favoritePost(userUuid: string, request: Request, postId?: string) {
  try {
    const extractedPostId = getPostIdFromContext(request, postId);
    if (!extractedPostId) {
      return createErrorResponse(new Error('Post ID is required'), 400);
    }

    // Check if post exists
    const post = await Post.findByPk(extractedPostId);
    if (!post) {
      return createErrorResponse(new Error('Post not found'), 404);
    }

    // Check if user exists
    const user = await User.findByPk(userUuid);
    if (!user) {
      return createErrorResponse(new Error('User not found'), 404);
    }

    // Check if already favorited
    const existingFavorite = await PostFavorite.findOne({
      where: { postUuid: extractedPostId, userUuid }
    });

    if (existingFavorite) {
      return createErrorResponse(new Error('Post already favorited'), 409);
    }

    // Create favorite
    await PostFavorite.create({ postUuid: extractedPostId, userUuid });

    return createResponse(null, 200, 'Post favorited successfully');
  } catch (error) {
    return createErrorResponse(error);
  }
}

// Unfavorite a post
export async function unfavoritePost(userUuid: string, request: Request, postId?: string) {
  try {
    const extractedPostId = getPostIdFromContext(request, postId);
    if (!extractedPostId) {
      return createErrorResponse(new Error('Post ID is required'), 400);
    }

    // Find and remove favorite
    const favorite = await PostFavorite.findOne({
      where: { postUuid: extractedPostId, userUuid }
    });

    if (!favorite) {
      return createErrorResponse(new Error('Favorite not found'), 404);
    }

    await favorite.destroy();

    return createResponse(null, 200, 'Post unfavorited successfully');
  } catch (error) {
    return createErrorResponse(error);
  }
}

// GET /api/posts/[id] - Get post by ID
export async function getPostById(request: Request, id: string) {
  try {
    await ensureDbReady();
    if (!id) {
      return createErrorResponse(new Error('Post ID is required'), 400);
    }

    const post = await Post.findByPk(id, {
      include: [{
        model: User,
        as: 'author',
        attributes: { exclude: ['parola'] },
      }],
    });

    if (!post) {
      return createErrorResponse(new Error('Post not found'), 404);
    }

    return createResponse(post, 200, 'Post retrieved successfully');
  } catch (error) {
    return createErrorResponse(error);
  }
}

// PUT /api/posts/[id] - Update post by ID
export async function updatePost(request: Request, id: string) {
  try {
    await ensureDbReady();
    if (!id) {
      return createErrorResponse(new Error('Post ID is required'), 400);
    }

    const body = await request.json();
    
    const post = await Post.findByPk(id);
    if (!post) {
      return createErrorResponse(new Error('Post not found'), 404);
    }

    // Don't allow updating authorUuid
    const { authorUuid, ...updateData } = body;
    if (authorUuid && authorUuid !== post.authorUuid) {
      return createErrorResponse(
        new Error('Cannot change post author'),
        400
      );
    }

    await post.update(updateData);
    
    // Fetch updated post with author information
    const updatedPost = await Post.findByPk(id, {
      include: [{
        model: User,
        as: 'author',
        attributes: { exclude: ['parola'] },
      }],
    });

    return createResponse(updatedPost, 200, 'Post updated successfully');
  } catch (error) {
    if (error instanceof Error && error.name === 'SequelizeValidationError') {
      return createErrorResponse(error, 400);
    }
    return createErrorResponse(error);
  }
}

// DELETE /api/posts/[id] - Delete post by ID
export async function deletePost(request: Request, id: string) {
  try {
    await ensureDbReady();
    if (!id) {
      return createErrorResponse(new Error('Post ID is required'), 400);
    }

    const post = await Post.findByPk(id);
    if (!post) {
      return createErrorResponse(new Error('Post not found'), 404);
    }

    await post.destroy();

    return createResponse(null, 200, 'Post deleted successfully');
  } catch (error) {
    return createErrorResponse(error);
  }
}

// GET /api/posts/search - Search posts
export async function searchPosts(request: Request) {
  try {
    await ensureDbReady();
    const url = new URL(request.url);
    const query = url.searchParams.get('q');
    const tags = url.searchParams.get('tags');
    const authorUuid = url.searchParams.get('author');
    const hasEvent = url.searchParams.get('hasEvent');

    if (!query && !tags && !authorUuid && !hasEvent) {
      return createErrorResponse(
        new Error('Search query, tags, author, or hasEvent parameter is required'),
        400
      );
    }

    const whereConditions: Array<Record<string, unknown>> = [];
    
    if (query) {
      whereConditions.push({
        text: { [Op.like]: `%${query}%` }
      });
    }
    
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      whereConditions.push({
        tags: { [Op.contains]: tagArray }
      });
    }
    
    if (authorUuid) {
      whereConditions.push({ authorUuid });
    }
    
    if (hasEvent === 'true') {
      whereConditions.push({
        event: { [Op.ne]: null }
      });
    } else if (hasEvent === 'false') {
      whereConditions.push({
        event: null
      });
    }

    const whereClause = whereConditions.length > 1 
      ? { [Op.and]: whereConditions }
      : whereConditions[0];

    const posts = await Post.findAll({
      where: whereClause,
      include: [{
        model: User,
        as: 'author',
        attributes: { exclude: ['parola'] },
      }],
      limit: 50, // Limit search results
      order: [['timestamp', 'DESC']],
    });

    return createResponse(posts, 200, 'Search completed successfully');
  } catch (error) {
    return createErrorResponse(error);
  }
}

// GET /api/posts/feed - Get personalized feed (posts from users in same department)
export async function getFeed(request: Request) {
  try {
    await ensureDbReady();
    const url = new URL(request.url);
    const userUuid = url.searchParams.get('user');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    if (!userUuid) {
      return createErrorResponse(new Error('User UUID is required'), 400);
    }

    // Get the user to find their department
    const currentUser = await User.findByPk(userUuid);
    if (!currentUser) {
      return createErrorResponse(new Error('User not found'), 404);
    }

    // Find all users in the same department
    const departmentUsers = await User.findAll({
      where: { departament: currentUser.departament },
      attributes: ['uuid'],
    });

    const departmentUserUuids = departmentUsers.map(user => user.uuid);

    const posts = await Post.findAndCountAll({
      where: {
        authorUuid: { [Op.in]: departmentUserUuids }
      },
      include: [{
        model: User,
        as: 'author',
        attributes: { exclude: ['parola'] },
      }],
      limit,
      offset,
      order: [['timestamp', 'DESC']],
    });

    return createResponse({
      posts: posts.rows,
      pagination: {
        page,
        limit,
        total: posts.count,
        pages: Math.ceil(posts.count / limit),
      }
    }, 200, 'Feed retrieved successfully');
  } catch (error) {
    return createErrorResponse(error);
  }
}
