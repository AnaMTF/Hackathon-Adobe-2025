import { getMessageById, markMessageAsRead, deleteMessage } from '../../../controllers/messages-controller';

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  return getMessageById(params.id);
}

export async function PUT(
  _request: Request,
  { params }: { params: { id: string } }
) {
  return markMessageAsRead(params.id);
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  return deleteMessage(params.id);
}
