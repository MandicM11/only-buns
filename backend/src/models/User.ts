import { User as PrismaUser, Post, Comment, Like } from '@prisma/client';

export interface User extends PrismaUser {
  posts: Post[];
  comments: Comment[];
  likes: Like[];
}
