import { getUserById, updateUser, deleteUser } from '../../../controllers/users-controller';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  return getUserById(request, params.id);
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  return updateUser(request, params.id);
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  return deleteUser(request, params.id);
}
