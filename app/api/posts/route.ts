import { getAllPosts, handlePostAction } from '../../controllers/posts-controller';

export async function GET(request: Request) {
  return getAllPosts(request);
}

export async function POST(request: Request) {
  return handlePostAction(request);
}