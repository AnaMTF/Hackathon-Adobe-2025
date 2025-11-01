import { User } from '../models/user-model';
import { ensureDbReady } from '../../lib/database';
import { Op } from 'sequelize';
import { UserActionSchema } from '../schemas/user-schemas';
import { messageSSEManager } from '../../lib/message-sse';

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

// GET /api/users - Get all users
export async function getAllUsers(request: Request) {
  try {
    await ensureDbReady();
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const search = url.searchParams.get('search') || '';
    const offset = (page - 1) * limit;

    // Build where clause for search
    const whereClause = search
      ? {
          [Op.or]: [
            { numeFullName: { [Op.like]: `%${search}%` } },
            { email: { [Op.like]: `%${search}%` } },
            { departament: { [Op.like]: `%${search}%` } },
            { jobTitle: { [Op.like]: `%${search}%` } },
          ],
        }
      : {};

    const users = await User.findAndCountAll({
      where: whereClause,
      attributes: { exclude: ['parola'] }, // Don't return passwords
      limit,
      offset,
      order: [
        ['status', 'ASC'], // online first, then away, busy, offline
        ['numeFullName', 'ASC'],
      ],
    });

    return createResponse({
      users: users.rows,
      pagination: {
        page,
        limit,
        total: users.count,
        pages: Math.ceil(users.count / limit),
      }
    }, 200, 'Users retrieved successfully');
  } catch (error) {
    return createErrorResponse(error);
  }
}

// POST /api/users - Handle user actions (create, update, delete)
export async function handleUserAction(request: Request) {
  try {
    await ensureDbReady();
    const body = await request.json();
    
    // Validate request body against schema
    const validationResult = UserActionSchema.safeParse(body);
    
    if (!validationResult.success) {
      return createErrorResponse(
        new Error(`Validation error: ${validationResult.error.issues.map(i => i.message).join(', ')}`),
        400
      );
    }

    const action = validationResult.data;

    switch (action.action) {
      case 'create':
        return await createUserInternal(action.fields);
      case 'update':
        return createErrorResponse(
          new Error('Update action should be sent to PUT /api/users/[id]'),
          400
        );
      case 'delete':
        return createErrorResponse(
          new Error('Delete action should be sent to DELETE /api/users/[id]'),
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

// Internal function to create user
async function createUserInternal(fields: {
  numeFullName: string;
  email: string;
  parola: string;
  departament: string;
  jobTitle: string;
  poza?: string;
  telefon?: string;
  location?: string;
}) {
  try {
    // Check if email already exists
    const existingUser = await User.findOne({ where: { email: fields.email } });
    if (existingUser) {
      return createErrorResponse(
        new Error('User with this email already exists'),
        409
      );
    }

    const user = await User.create(fields);
    
    // Remove password from response
    const userJson = user.toJSON();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { parola, ...userResponse } = userJson;

    return createResponse(userResponse, 201, 'User created successfully');
  } catch (error) {
    if (error instanceof Error && error.name === 'SequelizeValidationError') {
      return createErrorResponse(error, 400);
    }
    return createErrorResponse(error);
  }
}

// GET /api/users/[id] - Get user by ID
export async function getUserById(request: Request, id: string) {
  try {
    await ensureDbReady();
    if (!id) {
      return createErrorResponse({ message: 'User ID is required' }, 400);
    }

    const user = await User.findByPk(id, {
      attributes: { exclude: ['parola'] }, // Don't return password
    });

    if (!user) {
      return createErrorResponse({ message: 'User not found' }, 404);
    }

    return createResponse(user, 200, 'User retrieved successfully');
  } catch (error) {
    return createErrorResponse(error);
  }
}

// PUT /api/users/[id] - Update user by ID
export async function updateUser(request: Request, id: string) {
  try {
    await ensureDbReady();
    if (!id) {
      return createErrorResponse({ message: 'User ID is required' }, 400);
    }

    const body = await request.json();
    
    const user = await User.findByPk(id);
    if (!user) {
      return createErrorResponse({ message: 'User not found' }, 404);
    }

    // Check if email is being updated and if it already exists
    if (body.email && body.email !== user.email) {
      const existingUser = await User.findOne({ where: { email: body.email } });
      if (existingUser) {
        return createErrorResponse(
          { message: 'User with this email already exists' },
          409
        );
      }
    }

    await user.update(body);
    
    // Remove password from response
    const userJson = user.toJSON();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { parola, ...userResponse } = userJson;

    return createResponse(userResponse, 200, 'User updated successfully');
  } catch (error) {
    if (error instanceof Error && error.name === 'SequelizeValidationError') {
      return createErrorResponse(error, 400);
    }
    return createErrorResponse(error);
  }
}

// DELETE /api/users/[id] - Delete user by ID
export async function deleteUser(request: Request, id: string) {
  try {
    await ensureDbReady();
    if (!id) {
      return createErrorResponse({ message: 'User ID is required' }, 400);
    }

    const user = await User.findByPk(id);
    if (!user) {
      return createErrorResponse({ message: 'User not found' }, 404);
    }

    await user.destroy();

    return createResponse(null, 200, 'User deleted successfully');
  } catch (error) {
    return createErrorResponse(error);
  }
}

// GET /api/users/search - Search users
export async function searchUsers(request: Request) {
  try {
    await ensureDbReady();
    const url = new URL(request.url);
    const query = url.searchParams.get('q');
    const departament = url.searchParams.get('departament');
    const location = url.searchParams.get('location');

    if (!query && !departament && !location) {
      return createErrorResponse({ message: 'Search query, departament, or location is required' }, 400);
    }

    const whereConditions: Array<Record<string, unknown>> = [];
    
    if (query) {
      whereConditions.push({
        [Op.or]: [
          { numeFullName: { [Op.like]: `%${query}%` } },
          { email: { [Op.like]: `%${query}%` } },
          { jobTitle: { [Op.like]: `%${query}%` } },
        ]
      });
    }
    
    if (departament) {
      whereConditions.push({ departament: { [Op.like]: `%${departament}%` } });
    }
    
    if (location) {
      whereConditions.push({ location: { [Op.like]: `%${location}%` } });
    }

    const whereClause = whereConditions.length > 1 
      ? { [Op.and]: whereConditions }
      : whereConditions[0];

    const users = await User.findAll({
      where: whereClause,
      attributes: { exclude: ['parola'] },
      limit: 50, // Limit search results
    });

    return createResponse(users, 200, 'Search completed successfully');
  } catch (error) {
    return createErrorResponse(error);
  }
}

// PUT /api/users/[id]/status - Update user status
export async function updateUserStatus(userId: string, status: 'online' | 'away' | 'busy' | 'offline') {
  console.log('[updateUserStatus] Called with userId:', userId, 'status:', status);
  try {
    await ensureDbReady();
    console.log('[updateUserStatus] Database ready');

    const user = await User.findByPk(userId);
    console.log('[updateUserStatus] User found:', user ? 'yes' : 'no');
    
    if (!user) {
      console.log('[updateUserStatus] User not found');
      return createErrorResponse(new Error('User not found'), 404);
    }

    console.log('[updateUserStatus] Updating user status from', user.status, 'to', status);
    await user.update({
      status,
      lastSeen: new Date(),
    });
    console.log('[updateUserStatus] User updated successfully. New status:', user.status);

    // Broadcast status change via SSE to all connected clients
    console.log(`[updateUserStatus] Broadcasting status change for user ${userId}: ${status}`);
    messageSSEManager.broadcast({
      type: 'userStatusChanged',
      data: {
        uuid: userId,
        status,
        lastSeen: user.lastSeen,
      },
    });

    const userJson = user.toJSON();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { parola, ...userResponse } = userJson;

    console.log('[updateUserStatus] Returning success response');
    return createResponse(userResponse, 200, 'Status updated successfully');
  } catch (error) {
    console.error('[updateUserStatus] Error:', error);
    return createErrorResponse(error);
  }
}

// POST /api/users/heartbeat - Update user's lastSeen timestamp (called periodically from client)
export async function updateUserHeartbeat(userId: string) {
  try {
    await ensureDbReady();

    const user = await User.findByPk(userId);
    if (!user) {
      return createErrorResponse(new Error('User not found'), 404);
    }

    await user.update({
      lastSeen: new Date(),
    });

    return createResponse({ lastSeen: user.lastSeen }, 200, 'Heartbeat updated');
  } catch (error) {
    return createErrorResponse(error);
  }
}
