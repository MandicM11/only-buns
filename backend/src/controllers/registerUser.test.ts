import dotenv from "dotenv";
dotenv.config({ path: ".env.test" });

import { PrismaClient } from "@prisma/client";
import { registerUser } from "../controllers/userController";
import { Request, Response } from "express";

const prisma = new PrismaClient();

describe("registerUser", () => {
  beforeAll(async () => {
    // Clean up test users before tests to ensure no conflicts
    await prisma.user.deleteMany({
      where: {
        email: { in: ["test1@example.com", "test2@example.com"] },
      },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("should handle concurrent registration attempts with the same email", async () => {
    const email = "test1@example.com";

    // Define two registration requests with the same email
    const req1 = {
      body: {
        email,
        username: "test1",
        password: "password123",
        confirmPassword: "password123",
        name: "Test User",
        address: "123 Test Street",
      },
    } as Request;

    const req2 = {
      body: {
        email, // Same email as req1
        username: "test2",
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

    // Mock prisma.user.create to simulate unique constraint error for the second request
    const createMock = jest.spyOn(prisma.user, "create")
      .mockResolvedValueOnce({
        id: 1,
        email: email,
        username: "test1",
        password: "password123",
        name: "Test User",
        address: "123 Test Street",
        isActive: false,
        createdAt: new Date()
      })
      .mockRejectedValueOnce(new Error("Unique constraint failed on the fields: (email)"));

    // Run registerUser concurrently and await the result
    const results = await Promise.allSettled([
      registerUser(req1, res1),
      registerUser(req2, res2),
    ]);

    // Check that the first request is successful
    expect(res1.status).toHaveBeenCalledWith(201);
    expect(res1.json).toHaveBeenCalledWith(expect.objectContaining({
      message: "Registration successful. Check your email for activation link.",
    }));

    // Check that the second request fails with a 400 error
    expect(res2.status).toHaveBeenCalledWith(400);
    expect(res2.json).toHaveBeenCalledWith({
      error: "Email or Username is already taken.",
    });

    // Check the database state (only one user with the given email should exist)
    const userWithEmail = await prisma.user.findUnique({
      where: { email },
    });

    expect(userWithEmail).not.toBeNull(); // There should be a user created
    expect(userWithEmail?.username).toBe("test1"); // Check that the first user was created

    // Cleanup mock
    createMock.mockRestore();
  });
});
