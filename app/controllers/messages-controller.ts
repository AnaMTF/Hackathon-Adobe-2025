import { Message } from '../models/message-model';
import { User } from '../models/user-model';
import { ensureDbReady } from '../../lib/database';
import { Op } from 'sequelize';
import { MessageActionSchema } from '../schemas/message-schemas';

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

// GET /api/messages - Get all messages for a user (sent or received)
export async function getAllMessages(request: Request) {
  try {
    await ensureDbReady();
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const userUuid = url.searchParams.get('user'); // Required: which user's messages to fetch
    const conversationWith = url.searchParams.get('with'); // Optional: filter by conversation partner
    const unreadOnly = url.searchParams.get('unreadOnly') === 'true';
    const offset = (page - 1) * limit;

    if (!userUuid) {
      return createErrorResponse(new Error('User UUID is required'), 400);
    }

    // Build where clause for messages where user is sender or recipient
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let whereClause: any = {
      [Op.or]: [
        { senderUuid: userUuid },
        { recipientUuid: userUuid },
      ],
    };

    // If filtering by conversation partner
    if (conversationWith) {
      whereClause = {
        [Op.or]: [
          { senderUuid: userUuid, recipientUuid: conversationWith },
          { senderUuid: conversationWith, recipientUuid: userUuid },
        ],
      };
    }

    // If filtering for unread messages only
    if (unreadOnly) {
      whereClause = {
        ...whereClause,
        read: null,
        recipientUuid: userUuid, // Only show unread messages received by this user
      };
    }

    const messages = await Message.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['uuid', 'numeFullName', 'poza', 'departament', 'jobTitle'],
        },
        {
          model: User,
          as: 'recipient',
          attributes: ['uuid', 'numeFullName', 'poza', 'departament', 'jobTitle'],
        },
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    return createResponse({
      messages: messages.rows,
      pagination: {
        page,
        limit,
        total: messages.count,
        totalPages: Math.ceil(messages.count / limit),
      },
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}

// GET /api/messages/[id] - Get a specific message
export async function getMessageById(messageUuid: string) {
  try {
    await ensureDbReady();
    
    const message = await Message.findByPk(messageUuid, {
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['uuid', 'numeFullName', 'poza', 'departament', 'jobTitle'],
        },
        {
          model: User,
          as: 'recipient',
          attributes: ['uuid', 'numeFullName', 'poza', 'departament', 'jobTitle'],
        },
      ],
    });

    if (!message) {
      return createErrorResponse(new Error('Message not found'), 404);
    }

    return createResponse(message);
  } catch (error) {
    return createErrorResponse(error);
  }
}

// POST /api/messages - Handle message actions (create, markRead, delete)
export async function handleMessageAction(request: Request) {
  try {
    await ensureDbReady();
    
    const body = await request.json();
    const validation = MessageActionSchema.safeParse(body);

    if (!validation.success) {
      return createErrorResponse(
        new Error(`Validation failed: ${validation.error.message}`),
        400
      );
    }

    const { action } = validation.data;

    switch (action) {
      case 'create':
        return await createMessage(validation.data.fields, request);
      case 'markRead':
        return createErrorResponse(
          new Error('Use PUT /api/messages/[id] to mark as read'),
          400
        );
      case 'delete':
        return createErrorResponse(
          new Error('Use DELETE /api/messages/[id] to delete'),
          400
        );
      default:
        return createErrorResponse(new Error('Invalid action'), 400);
    }
  } catch (error) {
    return createErrorResponse(error);
  }
}

// Helper: Create a new message
async function createMessage(
  fields: { recipientUuid: string; text: string },
  request: Request
) {
  try {
    // Get sender UUID from request (assuming auth context provides it)
    const url = new URL(request.url);
    const senderUuid = url.searchParams.get('sender');

    if (!senderUuid) {
      return createErrorResponse(
        new Error('Sender UUID is required'),
        400
      );
    }

    // Verify sender exists
    const sender = await User.findByPk(senderUuid);
    if (!sender) {
      return createErrorResponse(new Error('Sender not found'), 404);
    }

    // Verify recipient exists
    const recipient = await User.findByPk(fields.recipientUuid);
    if (!recipient) {
      return createErrorResponse(new Error('Recipient not found'), 404);
    }

    // Create the message
    const message = await Message.create({
      senderUuid,
      recipientUuid: fields.recipientUuid,
      text: fields.text,
      read: null,
    });

    // Fetch the created message with associations
    const createdMessage = await Message.findByPk(message.uuid, {
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['uuid', 'numeFullName', 'poza', 'departament', 'jobTitle'],
        },
        {
          model: User,
          as: 'recipient',
          attributes: ['uuid', 'numeFullName', 'poza', 'departament', 'jobTitle'],
        },
      ],
    });

    return createResponse(createdMessage, 201, 'Message sent successfully');
  } catch (error) {
    return createErrorResponse(error);
  }
}

// PUT /api/messages/[id] - Mark a message as read
export async function markMessageAsRead(messageUuid: string) {
  try {
    await ensureDbReady();

    const message = await Message.findByPk(messageUuid);

    if (!message) {
      return createErrorResponse(new Error('Message not found'), 404);
    }

    // Only mark as read if it's currently unread
    if (message.read === null) {
      message.read = new Date();
      await message.save();
    }

    // Fetch the updated message with associations
    const updatedMessage = await Message.findByPk(messageUuid, {
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['uuid', 'numeFullName', 'poza', 'departament', 'jobTitle'],
        },
        {
          model: User,
          as: 'recipient',
          attributes: ['uuid', 'numeFullName', 'poza', 'departament', 'jobTitle'],
        },
      ],
    });

    return createResponse(updatedMessage, 200, 'Message marked as read');
  } catch (error) {
    return createErrorResponse(error);
  }
}

// DELETE /api/messages/[id] - Delete a message
export async function deleteMessage(messageUuid: string) {
  try {
    await ensureDbReady();

    const message = await Message.findByPk(messageUuid);

    if (!message) {
      return createErrorResponse(new Error('Message not found'), 404);
    }

    // Optional: Add authorization check here to ensure only sender or recipient can delete

    await message.destroy();

    return createResponse(
      { uuid: messageUuid },
      200,
      'Message deleted successfully'
    );
  } catch (error) {
    return createErrorResponse(error);
  }
}

// GET /api/messages/conversations - Get list of conversations for a user
export async function getConversations(request: Request) {
  try {
    await ensureDbReady();
    const url = new URL(request.url);
    const userUuid = url.searchParams.get('user');

    if (!userUuid) {
      return createErrorResponse(new Error('User UUID is required'), 400);
    }

    // Get all unique conversation partners
    const sentMessages = await Message.findAll({
      where: { senderUuid: userUuid },
      attributes: ['recipientUuid'],
      group: ['recipientUuid'],
    });

    const receivedMessages = await Message.findAll({
      where: { recipientUuid: userUuid },
      attributes: ['senderUuid'],
      group: ['senderUuid'],
    });

    // Combine and get unique UUIDs
    const partnerUuids = new Set<string>();
    sentMessages.forEach(msg => partnerUuids.add(msg.recipientUuid));
    receivedMessages.forEach(msg => partnerUuids.add(msg.senderUuid));

    // Fetch user details for each conversation partner
    const partners = await User.findAll({
      where: {
        uuid: Array.from(partnerUuids),
      },
      attributes: ['uuid', 'numeFullName', 'poza', 'departament', 'jobTitle'],
    });

    // Get last message and unread count for each conversation
    const conversations = await Promise.all(
      partners.map(async (partner) => {
        const lastMessage = await Message.findOne({
          where: {
            [Op.or]: [
              { senderUuid: userUuid, recipientUuid: partner.uuid },
              { senderUuid: partner.uuid, recipientUuid: userUuid },
            ],
          },
          order: [['createdAt', 'DESC']],
        });

        const unreadCount = await Message.count({
          where: {
            senderUuid: partner.uuid,
            recipientUuid: userUuid,
            read: null,
          },
        });

        return {
          partner,
          lastMessage,
          unreadCount,
        };
      })
    );

    // Sort by last message timestamp
    conversations.sort((a, b) => {
      const timeA = a.lastMessage?.createdAt?.getTime() || 0;
      const timeB = b.lastMessage?.createdAt?.getTime() || 0;
      return timeB - timeA;
    });

    return createResponse({ conversations });
  } catch (error) {
    return createErrorResponse(error);
  }
}
