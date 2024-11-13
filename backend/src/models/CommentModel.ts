import { Comment as PrismaComment, User, Post } from '@prisma/client';

export interface Comment extends PrismaComment {
  user: User;
  post: Post;
}

