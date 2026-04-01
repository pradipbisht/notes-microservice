import { Router } from "express";

import * as authController from "./auth.controller";
import { validateRequest } from "../../../shared/middleware";
import { loginSchema, refreshTokenSchema, registerSchema } from "./validation";
import { authenticateToken } from "./auth.middleware";

const router = Router();

// register route
router.post(
  "/register",
  validateRequest(registerSchema),
  authController.register,
);

// login route
router.post("/login", validateRequest(loginSchema), authController.login);

// refresh token route
router.post(
  "/refresh-token",
  validateRequest(refreshTokenSchema),
  authController.refreshToken,
);

// logout route
router.post(
  "/logout",
  validateRequest(refreshTokenSchema),
  authController.logout,
);

// validate token route
router.get("/validate-token", authController.validateToken);

// other routes profile ,etc
router.get("/profile", authenticateToken, authController.getProfile);
router.delete("/profile", authenticateToken, authController.deleteAccount);

export default router;
