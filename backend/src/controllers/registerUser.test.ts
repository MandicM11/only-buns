import { PrismaClient } from "@prisma/client";
import { registerUser } from "../controllers/userController";
import { Request, Response, NextFunction } from "express";

const prisma = new PrismaClient();

describe("registerUser", () => {
  beforeAll(async () => {
    // Delete from the most dependent tables first to avoid foreign key constraint violations
    await prisma.comment.deleteMany({});
    await prisma.like.deleteMany({});
    await prisma.post.deleteMany({});
    await prisma.user.deleteMany({});
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("should handle concurrent registration attempts correctly", async () => {
    const req1 = {
      body: {
        email: "test1@example.com",
        username: "testuser",
        password: "password123",
        confirmPassword: "password123",
        name: "Test User",
        address: "123 Test Street",
      },
    } as Request;

    const req2 = {
      body: {
        email: "test2@example.com",
        username: "testuser", // Same username as req1
        password: "password456",
        confirmPassword: "password456",
        name: "Another Test User",
        address: "456 Test Street",
      },
    } as Request;

    const res1 = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    const res2 = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    const next = jest.fn(); // Mock the `next` function

    // Run registerUser concurrently
    const promise1 = registerUser(req1, res1);
    const promise2 = registerUser(req2, res2);

    // Await both promises
    await Promise.allSettled([promise1, promise2]);

    // Assertions for the first request
    expect(res1.status).toHaveBeenCalledWith(201);
    expect(res1.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Registration successful. Check your email for activation link." })
    );

    // Assertions for the second request (should fail)
    expect(res2.status).toHaveBeenCalledWith(400);
    expect(res2.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Username is already taken." })
    );
  });
});
