import { createErrorResponse } from '@shared/utils';
import { NextFunction, Request, Response } from 'express';
import { AuthService } from './authService';

const authService = new AuthService();

export async function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res
      .status(401)
      .json(createErrorResponse('Access token is required'));
  }

  try {
    const payload = await authService.validateToken(token);
    req.user = payload;
    next();
    return;
  } catch (error) {
    return res
      .status(401)
      .json(createErrorResponse('Invalid or expired token'));
  }
}
