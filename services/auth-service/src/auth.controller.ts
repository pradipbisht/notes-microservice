import { asyncHandler } from "../../../shared/middleware";
import { AuthService } from "./authService";
import { Request, Response } from "express";
import { createSuccessResponse } from "../../../shared/utils";
import { createErrorResponse } from "../../../shared/utils";

const authService = new AuthService();

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const tokens = await authService.register(email, password);

  res
    .status(201)
    .json(createSuccessResponse(tokens, "User registered successfully"));
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const tokens = await authService.login(email, password);

  res
    .status(200)
    .json(createSuccessResponse(tokens, "User logged in successfully"));
});

export const refreshToken = asyncHandler(
  async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    const tokens = await authService.refreshToken(refreshToken);

    res
      .status(200)
      .json(createSuccessResponse(tokens, "Token refreshed successfully"));
  },
);

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  await authService.logout(refreshToken);

  res
    .status(200)
    .json(createSuccessResponse(null, "User logged out successfully"));
});

export const validateToken = asyncHandler(
  async (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(400).json(createErrorResponse("Token is required"));
    }

    const payload = await authService.validateToken(token);

    if (!payload) {
      return res
        .status(401)
        .json(createErrorResponse("Invalid or expired token"));
    }

    res.status(200).json(createSuccessResponse(payload, "Token is valid"));
    return;
  },
);

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json(createErrorResponse("User ID is required"));
  }

  const user = await authService.getUserById(userId);

  res.status(200).json(createSuccessResponse(user, "User found successfully"));
  return;
});

export const deleteAccount = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json(createErrorResponse("User ID is required"));
    }

    await authService.deleteUser(userId);

    res
      .status(200)
      .json(createSuccessResponse(null, "Account deleted successfully"));
    return;
  },
);
