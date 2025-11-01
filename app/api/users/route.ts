import { getAllUsers, handleUserAction } from '../../controllers/users-controller';

export async function GET(request: Request) {
  return getAllUsers(request);
}

export async function POST(request: Request) {
  return handleUserAction(request);
}
