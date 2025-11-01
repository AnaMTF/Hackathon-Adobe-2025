import { getAllMessages, handleMessageAction, getConversations } from '../../controllers/messages-controller';

export async function GET(request: Request) {
  const url = new URL(request.url);
  
  // Check if this is a request for conversations list
  if (url.pathname.includes('/conversations')) {
    return getConversations(request);
  }
  
  return getAllMessages(request);
}

export async function POST(request: Request) {
  return handleMessageAction(request);
}
