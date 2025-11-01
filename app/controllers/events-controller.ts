import { Event } from '../models/event-model';
import { User } from '../models/user-model';
import { ensureDbReady } from '../../lib/database';
import { Op } from 'sequelize';
import { EventActionSchema } from '../schemas/event-schemas';

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

// GET /api/events - Get all events with optional filtering
export async function getAllEvents(request: Request) {
  try {
    await ensureDbReady();
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const creatorUuid = url.searchParams.get('creator');
    const date = url.searchParams.get('date'); // YYYY-MM-DD format
    const startDate = url.searchParams.get('startDate'); // YYYY-MM-DD format
    const endDate = url.searchParams.get('endDate'); // YYYY-MM-DD format
    const offset = (page - 1) * limit;

    const whereClause: Record<string, unknown> = {};
    
    if (creatorUuid) {
      whereClause.creatorUuid = creatorUuid;
    }

    if (date) {
      whereClause.date = date;
    } else if (startDate || endDate) {
      const dateFilter: Record<symbol, string> = {};
      if (startDate) {
        dateFilter[Op.gte] = startDate;
      }
      if (endDate) {
        dateFilter[Op.lte] = endDate;
      }
      whereClause.date = dateFilter;
    }

    const events = await Event.findAndCountAll({
      where: whereClause,
      include: [{
        model: User,
        as: 'creator',
        attributes: { exclude: ['parola'] }, // Don't include password
      }],
      limit,
      offset,
      order: [['date', 'ASC'], ['createdAt', 'ASC']],
    });

    return createResponse({
      events: events.rows,
      pagination: {
        page,
        limit,
        total: events.count,
        pages: Math.ceil(events.count / limit),
      }
    }, 200, 'Events retrieved successfully');
  } catch (error) {
    return createErrorResponse(error);
  }
}

// POST /api/events - Handle event actions (create)
export async function handleEventAction(request: Request) {
  try {
    await ensureDbReady();
    const body = await request.json();
    
    // Validate request body against schema
    const validationResult = EventActionSchema.safeParse(body);
    
    if (!validationResult.success) {
      return createErrorResponse(
        new Error(`Validation error: ${validationResult.error.issues.map(i => i.message).join(', ')}`),
        400
      );
    }

    const action = validationResult.data;

    switch (action.action) {
      case 'create':
        return await createEventInternal(action.fields);
      default:
        return createErrorResponse(new Error('Invalid action'), 400);
    }
  } catch (error) {
    return createErrorResponse(error);
  }
}

// Internal function to create an event
async function createEventInternal(eventData: { name: string; details?: string; date: string; creatorUuid: string }) {
  try {
    // Verify creator exists
    const creator = await User.findByPk(eventData.creatorUuid);
    if (!creator) {
      return createErrorResponse(new Error('Creator user not found'), 404);
    }

    // Create the event
    const event = await Event.create({
      name: eventData.name,
      details: eventData.details,
      date: new Date(eventData.date),
      creatorUuid: eventData.creatorUuid,
    });

    // Fetch the created event with creator info
    const createdEvent = await Event.findByPk(event.uuid, {
      include: [{
        model: User,
        as: 'creator',
        attributes: { exclude: ['parola'] },
      }],
    });

    return createResponse(createdEvent, 201, 'Event created successfully');
  } catch (error) {
    return createErrorResponse(error);
  }
}

// GET /api/events/:id - Get a specific event by ID
export async function getEventById(eventId: string) {
  try {
    await ensureDbReady();

    const event = await Event.findByPk(eventId, {
      include: [{
        model: User,
        as: 'creator',
        attributes: { exclude: ['parola'] },
      }],
    });

    if (!event) {
      return createErrorResponse(new Error('Event not found'), 404);
    }

    return createResponse(event, 200, 'Event retrieved successfully');
  } catch (error) {
    return createErrorResponse(error);
  }
}

// PATCH /api/events/:id - Update an event
export async function updateEvent(eventId: string, request: Request) {
  try {
    await ensureDbReady();
    const body = await request.json();
    
    // Validate request body against schema
    const validationResult = EventActionSchema.safeParse(body);
    
    if (!validationResult.success) {
      return createErrorResponse(
        new Error(`Validation error: ${validationResult.error.issues.map(i => i.message).join(', ')}`),
        400
      );
    }

    const action = validationResult.data;

    if (action.action !== 'update') {
      return createErrorResponse(new Error('Invalid action for update'), 400);
    }

    const event = await Event.findByPk(eventId);
    
    if (!event) {
      return createErrorResponse(new Error('Event not found'), 404);
    }

    // Update the event
    const updateData: Partial<{ name: string; details: string; date: Date }> = {};
    
    if (action.fields.name !== undefined) {
      updateData.name = action.fields.name;
    }
    if (action.fields.details !== undefined) {
      updateData.details = action.fields.details;
    }
    if (action.fields.date !== undefined) {
      updateData.date = new Date(action.fields.date);
    }

    await event.update(updateData);

    // Fetch updated event with creator info
    const updatedEvent = await Event.findByPk(eventId, {
      include: [{
        model: User,
        as: 'creator',
        attributes: { exclude: ['parola'] },
      }],
    });

    return createResponse(updatedEvent, 200, 'Event updated successfully');
  } catch (error) {
    return createErrorResponse(error);
  }
}

// DELETE /api/events/:id - Delete an event
export async function deleteEvent(eventId: string, request: Request) {
  try {
    await ensureDbReady();
    const body = await request.json();
    
    // Validate request body against schema
    const validationResult = EventActionSchema.safeParse(body);
    
    if (!validationResult.success) {
      return createErrorResponse(
        new Error(`Validation error: ${validationResult.error.issues.map(i => i.message).join(', ')}`),
        400
      );
    }

    const action = validationResult.data;

    if (action.action !== 'delete') {
      return createErrorResponse(new Error('Invalid action for delete'), 400);
    }

    const event = await Event.findByPk(eventId);
    
    if (!event) {
      return createErrorResponse(new Error('Event not found'), 404);
    }

    await event.destroy();

    return createResponse({ uuid: eventId }, 200, 'Event deleted successfully');
  } catch (error) {
    return createErrorResponse(error);
  }
}
