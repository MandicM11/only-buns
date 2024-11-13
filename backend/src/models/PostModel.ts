import { Post as PrismaPost, Comment, Like } from '@prisma/client';

export interface Post extends PrismaPost {
  comments: Comment[];
  likes: Like[];
}
