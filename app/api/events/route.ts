import { getAllEvents, handleEventAction } from '../../controllers/events-controller';

export async function GET(request: Request) {
  return getAllEvents(request);
}

export async function POST(request: Request) {
  return handleEventAction(request);
}
