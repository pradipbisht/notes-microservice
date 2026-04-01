import dotenv from "dotenv";
dotenv.config();

import { createServiceError } from "../../../shared/utils";
import { AuthTokens, JWTPayload, ServiceError } from "../../../shared/types";
import prisma from "./database";
import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { StringValue } from "ms";

export class AuthService {
  private readonly jwtSecret: string;
  private readonly jwtRefreshSecret: string;
  private readonly jwtExpiresIn: StringValue;
  private readonly jwtRefreshExpiresIn: StringValue;
  private readonly bcryptRounds: number;

  constructor() {
    this.jwtSecret = this.getEnv("JWT_SECRET");
    this.jwtRefreshSecret = this.getEnv("JWT_REFRESH_SECRET");
    this.jwtExpiresIn = this.getEnv("JWT_EXPIRES_IN") as StringValue;
    this.jwtRefreshExpiresIn = this.getEnv(
      "JWT_REFRESH_EXPIRES_IN",
    ) as StringValue;
    this.bcryptRounds = Number(this.getEnv("BCRYPT_ROUNDS"));
  }

  private getEnv(key: string): string {
    const value = process.env[key];
    if (!value) {
      throw new Error(`${key} is not defined`);
    }
    return value;
  }

  async register(email: string, password: string): Promise<AuthTokens> {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw createServiceError("User already exists", 400);
    }

    // ✅ FIXED bcrypt
    const hashedPassword = await bcrypt.hash(password, this.bcryptRounds);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    return this.generateTokens(user.id, user.email);
  }

  async login(email: string, password: string): Promise<AuthTokens> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw createServiceError("Invalid email or password", 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw createServiceError("Invalid email or password", 401);
    }

    return this.generateTokens(user.id, user.email);
  }

  private async generateTokens(
    userId: string,
    email: string,
  ): Promise<AuthTokens> {
    const payload = { userId, email };

    // ✅ Access Token
    const accessToken = jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn,
    } as SignOptions);

    // ✅ Refresh Token
    const refreshToken = jwt.sign(payload, this.jwtRefreshSecret, {
      expiresIn: this.jwtRefreshExpiresIn,
    } as SignOptions);

    // ✅ Delete existing refresh tokens for user
    await prisma.refreshToken.deleteMany({
      where: { userId },
    });

    // ✅ Store refresh token in DB
    await prisma.refreshToken.create({
      data: {
        userId,
        token: refreshToken,
        expiresAt: new Date(
          Date.now() + this.parseExpiry(this.jwtRefreshExpiresIn),
        ),
      },
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  // 🔥 helper for expiry conversion
  private parseExpiry(exp: StringValue): number {
    const ms = require("ms");
    return ms(exp);
  }

  // refersh token
  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      const decoded = jwt.verify(refreshToken, this.jwtRefreshSecret) as {
        userId: string;
        email: string;
      };

      const storedToken = await prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: true },
      });

      if (!storedToken || storedToken.expiresAt < new Date()) {
        throw createServiceError("Invalid or expired refresh token", 401);
      }

      const tokens = await this.generateTokens(
        storedToken.user.id,
        storedToken.user.email,
      );

      await prisma.refreshToken.delete({
        where: { token: refreshToken },
      });

      return tokens;
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error;
      }
      throw createServiceError("Invalid or expired refresh token", 401);
    }
  }

  async logout(refreshToken: string): Promise<void> {
    await prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });
  }

  // validate token
  async validateToken(token: string): Promise<JWTPayload> {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as JWTPayload;

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user) {
        throw createServiceError("User not found", 404);
      }

      return decoded;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw createServiceError("Invalid token", 401);
      }
      throw createServiceError("Invalid or expired token", 500, error);
    }
  }

  async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw createServiceError("User not found", 404);
    }

    return user;
  }

  async deleteUser(userId: string): Promise<void> {
    await prisma.user.delete({
      where: { id: userId },
    });
  }
}
