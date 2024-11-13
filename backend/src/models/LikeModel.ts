import { Like as PrismaLike, User, Post } from '@prisma/client';

export interface Like extends PrismaLike {
  user: User;
  post: Post;
}
