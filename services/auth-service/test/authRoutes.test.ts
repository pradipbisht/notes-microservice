import request from "supertest";
import express from "express";
import authRoutes from "../src/auth.route";
import prisma from "../src/database";
import { errorHandler } from "../../../shared/middleware";

const app = express();
app.use(express.json());
app.use("/auth", authRoutes);
app.use(errorHandler);

describe("Auth Routes", () => {
  beforeAll(async () => {
    // Ensure database is connected
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean up database
    await prisma.refreshToken.deleteMany();
    await prisma.user.deleteMany();
  });

  describe("POST /auth/register", () => {
    it("should register a new user", async () => {
      const response = await request(app)
        .post("/auth/register")
        .send({
          email: "test@example.com",
          password: "password123",
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("accessToken");
      expect(response.body.data).toHaveProperty("refreshToken");
    });

    it("should return validation error for invalid email", async () => {
      const response = await request(app)
        .post("/auth/register")
        .send({
          email: "invalid-email",
          password: "password123",
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Validation error");
    });
  });

  describe("POST /auth/login", () => {
    beforeEach(async () => {
      // Register a user for login tests
      await request(app).post("/auth/register").send({
        email: "login@example.com",
        password: "password123",
      });
    });

    it("should login with correct credentials", async () => {
      const response = await request(app)
        .post("/auth/login")
        .send({
          email: "login@example.com",
          password: "password123",
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("accessToken");
    });

    it("should return error for wrong password", async () => {
      const response = await request(app)
        .post("/auth/login")
        .send({
          email: "login@example.com",
          password: "wrongpassword",
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /auth/validate-token", () => {
    it("should validate a valid token", async () => {
      // Register and get token
      const registerResponse = await request(app).post("/auth/register").send({
        email: "validate@example.com",
        password: "password123",
      });

      const token = registerResponse.body.data.accessToken;

      const response = await request(app)
        .get("/auth/validate-token")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("userId");
    });

    it("should return error for missing token", async () => {
      const response = await request(app)
        .get("/auth/validate-token")
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe("Token is required");
    });
  });

  describe("GET /auth/profile", () => {
    let token: string;

    beforeEach(async () => {
      // Register and get token
      const registerResponse = await request(app).post("/auth/register").send({
        email: "profile@example.com",
        password: "password123",
      });

      token = registerResponse.body.data.accessToken;
    });

    it("should return user profile with valid token", async () => {
      const response = await request(app)
        .get("/auth/profile")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("id");
      expect(response.body.data.email).toBe("profile@example.com");
    });

    it("should return error without token", async () => {
      const response = await request(app).get("/auth/profile").expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});
