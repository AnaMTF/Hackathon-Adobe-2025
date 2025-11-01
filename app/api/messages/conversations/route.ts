import { getConversations } from '../../../controllers/messages-controller';

export async function GET(request: Request) {
  return getConversations(request);
}
