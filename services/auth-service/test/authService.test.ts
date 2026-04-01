import { AuthService } from "../src/authService";
import prisma from "../src/database";

describe("AuthService", () => {
  let authService: AuthService;

  beforeAll(async () => {
    authService = new AuthService();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean up database before each test
    await prisma.refreshToken.deleteMany();
    await prisma.user.deleteMany();
  });

  describe("register", () => {
    it("should register a new user successfully", async () => {
      const email = "test@example.com";
      const password = "password123";

      const result = await authService.register(email, password);

      expect(result).toHaveProperty("accessToken");
      expect(result).toHaveProperty("refreshToken");

      // Verify user was created
      const user = await prisma.user.findUnique({ where: { email } });
      expect(user).toBeTruthy();
      expect(user?.email).toBe(email);
    });

    it("should throw error if user already exists", async () => {
      const email = "existing@example.com";
      const password = "password123";

      // Create user first
      await authService.register(email, password);

      // Try to register again
      await expect(authService.register(email, password)).rejects.toThrow(
        "User already exists",
      );
    });
  });

  describe("login", () => {
    it("should login user with correct credentials", async () => {
      const email = "login@example.com";
      const password = "password123";

      // Register user first
      await authService.register(email, password);

      // Login
      const result = await authService.login(email, password);

      expect(result).toHaveProperty("accessToken");
      expect(result).toHaveProperty("refreshToken");
    });

    it("should throw error with invalid credentials", async () => {
      const email = "invalid@example.com";
      const password = "wrongpassword";

      await expect(authService.login(email, password)).rejects.toThrow(
        "Invalid email or password",
      );
    });
  });

  describe("validateToken", () => {
    it("should validate a valid token", async () => {
      const email = "validate@example.com";
      const password = "password123";

      // Register and get tokens
      const tokens = await authService.register(email, password);

      // Validate token
      const payload = await authService.validateToken(tokens.accessToken);

      expect(payload).toHaveProperty("userId");
      expect(payload.email).toBe(email);
    });

    it("should throw error for invalid token", async () => {
      await expect(authService.validateToken("invalid-token")).rejects.toThrow(
        "Invalid token",
      );
    });
  });

  describe("getUserById", () => {
    it("should return user data", async () => {
      const email = "getuser@example.com";
      const password = "password123";

      // Register user
      const tokens = await authService.register(email, password);
      const payload = await authService.validateToken(tokens.accessToken);

      // Get user
      const user = await authService.getUserById(payload.userId);

      expect(user).toHaveProperty("id");
      expect(user.email).toBe(email);
    });

    it("should throw error for non-existent user", async () => {
      await expect(authService.getUserById("non-existent-id")).rejects.toThrow(
        "User not found",
      );
    });
  });
});
