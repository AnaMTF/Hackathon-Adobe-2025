import { NextResponse } from 'next/server';
import Comment from '@/app/models/comment-model';
import { Post } from '@/app/models/post-model';
import User from '@/app//models/user-model';


export async function POST(req: Request, { params }: { params: { postId: string } }) {
  const { userUuid, text } = await req.json();

  if (!text?.trim()) return NextResponse.json({ error: 'Comment cannot be empty' }, { status: 400 });

  const comment = await Comment.create({
    postUuid: params.postId,
    authorUuid: userUuid,
    text,
  });

  const author = await comment.getAuthor();

  return NextResponse.json({ ...comment.toJSON(), author: { uuid: author.uuid, username: author.numeFullName } });
}

export async function GET(req: Request, { params }: { params: { postId: string } }) {
  const comments = await Comment.findAll({
    where: { postUuid: params.postId },
    include: [{ model: User, as: 'author', attributes: ['uuid', 'username'] }],
    order: [['createdAt', 'ASC']],
  });

  return NextResponse.json(comments);
}
